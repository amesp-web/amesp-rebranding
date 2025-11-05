import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Opcional: permite testar rapidamente no navegador se a rota existe
export async function GET() {
  return NextResponse.json({ ok: true, message: 'AI News Suggestion API ativa. Use POST com { topic }.' })
}

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tópico é obrigatório' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY não configurada no .env.local')
      return NextResponse.json(
        { error: 'Configuração de API não encontrada' },
        { status: 500 }
      )
    }

    // 🚀 Prompt otimizado (mais direto = mais rápido)
    const prompt = `Jornalista de maricultura. Tópico: "${topic}"

Retorne APENAS JSON (sem markdown):
{
  "titles": ["Título 1", "Título 2", "Título 3"],
  "lead": "Primeiro parágrafo (100 palavras)",
  "structure": {
    "sections": [
      {"subtitle": "Seção 1", "topics": ["Tópico 1", "Tópico 2"]},
      {"subtitle": "Seção 2", "topics": ["Tópico 1", "Tópico 2"]}
    ]
  }
}

Regras:
- Títulos atraentes de maricultura
- Lead: 100 palavras
- 2-3 seções, 2-3 tópicos/seção
- PT-BR
- APENAS JSON puro`

    // 🚀 OTIMIZAÇÃO: Use o modelo configurado no .env.local
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    
    console.log('🤖 Usando modelo:', model)
    console.log('🔑 API Key presente:', !!apiKey)
    
    // Timeout de 15 segundos (gemini-2.5-flash pode levar um pouco mais)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    
    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.7, 
            topK: 40, 
            topP: 0.95, 
            maxOutputTokens: 2048,  // gemini-2.5-flash precisa de mais tokens
            responseMimeType: "application/json"  // Força retorno em JSON puro
          },
        }),
        signal: controller.signal
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        console.error('❌ Timeout na API Gemini')
        return NextResponse.json({ error: 'Tempo limite excedido. Tente novamente.' }, { status: 504 })
      }
      throw fetchError
    } finally {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na API Gemini:', errorText)
      return NextResponse.json({ error: 'Modelo indisponível no momento. Tente novamente.' }, { status: 502 })
    }

    const data = await response.json()
    
    console.log('📦 Resposta completa do Gemini API:', JSON.stringify(data, null, 2))

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('❌ Estrutura de resposta inválida:', data)
      
      // Verificar se foi bloqueado por safety
      if (data.candidates?.[0]?.finishReason === 'SAFETY') {
        return NextResponse.json(
          { error: 'Conteúdo bloqueado por filtros de segurança. Tente outro tópico.' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Resposta inválida da IA. Verifique os logs do servidor.' },
        { status: 500 }
      )
    }

    const generatedText = data.candidates[0].content.parts[0].text.trim()
    
    console.log('🤖 Resposta bruta do Gemini (primeiros 500 chars):')
    console.log(generatedText.substring(0, 500))
    console.log('...')

    // 🔧 Melhorar extração de JSON (múltiplas tentativas)
    let parsed: any = null
    
    // Tentativa 1: JSON direto
    try {
      parsed = JSON.parse(generatedText)
    } catch {
      // Tentativa 2: Remover markdown code blocks
      const jsonMatch = generatedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[1])
        } catch {}
      }
      
      // Tentativa 3: Extrair primeiro objeto JSON encontrado
      if (!parsed) {
        const firstBrace = generatedText.indexOf('{')
        const lastBrace = generatedText.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          try {
            parsed = JSON.parse(generatedText.substring(firstBrace, lastBrace + 1))
          } catch {}
        }
      }
    }

    // 🔧 Se não conseguiu parsear, criar estrutura base usando o texto retornado
    if (!parsed) {
      console.warn('⚠️ Não foi possível parsear JSON. Criando estrutura base com o texto...')
      
      // Extrair pelo menos os títulos se houver
      const lines = generatedText.split('\n').filter(l => l.trim())
      
      parsed = {
        titles: [
          topic.charAt(0).toUpperCase() + topic.slice(1),
          "Novidades sobre " + topic,
          "Saiba mais sobre " + topic
        ],
        lead: lines[0] || "Informações importantes sobre " + topic + ".",
        structure: {
          sections: [
            { subtitle: "Introdução", topics: ["Contexto geral", "Importância do tema"] },
            { subtitle: "Desenvolvimento", topics: ["Detalhes principais", "Impactos e resultados"] }
          ]
        }
      }
    }

    // Validar e garantir estrutura mínima (sempre garante algo válido)
    if (!parsed.titles || !Array.isArray(parsed.titles) || parsed.titles.length === 0) {
      parsed.titles = [
        topic.charAt(0).toUpperCase() + topic.slice(1),
        "Novidades: " + topic,
        "Tudo sobre " + topic
      ]
    }
    
    if (!parsed.lead || typeof parsed.lead !== 'string' || parsed.lead.length < 10) {
      parsed.lead = "Descubra as últimas novidades e informações importantes sobre " + topic + ". Este tema tem grande relevância para o setor de maricultura e aquicultura."
    }
    
    if (!parsed.structure || !parsed.structure.sections || !Array.isArray(parsed.structure.sections) || parsed.structure.sections.length === 0) {
      parsed.structure = {
        sections: [
          { 
            subtitle: "Contexto e Importância", 
            topics: [
              "Panorama atual sobre " + topic,
              "Relevância para o setor",
              "Principais desafios"
            ]
          },
          { 
            subtitle: "Desenvolvimento e Impactos", 
            topics: [
              "Detalhes e informações técnicas",
              "Impactos na maricultura",
              "Perspectivas futuras"
            ]
          }
        ]
      }
    }

    console.log('✅ Estrutura final validada e pronta')
    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error('❌ Erro inesperado na API de sugestão:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

