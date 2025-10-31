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

    // Prompt estruturado para gerar esboço de notícia
    const prompt = `Você é um jornalista especializado em maricultura e aquicultura. 
Crie um esboço completo de notícia sobre: "${topic}"

IMPORTANTE: Retorne APENAS um JSON válido, sem markdown, sem code blocks, sem texto adicional. Apenas o objeto JSON puro.

Formato obrigatório:
{
  "titles": ["Título opção 1", "Título opção 2", "Título opção 3"],
  "lead": "Primeiro parágrafo instigante que captura a atenção do leitor...",
  "structure": {
    "sections": [
      {
        "subtitle": "Subtítulo da seção 1",
        "topics": ["Tópico 1", "Tópico 2", "Tópico 3"]
      },
      {
        "subtitle": "Subtítulo da seção 2",
        "topics": ["Tópico 1", "Tópico 2"]
      }
    ]
  }
}

Diretrizes:
- Títulos: atraentes, informativos, relacionados à maricultura/aquicultura
- Lead: 100-150 palavras, primeiro parágrafo instigante
- Subtítulos: descritivos e informativos
- Tópicos: bullets importantes para cada seção (2-4 tópicos por seção)
- Idioma: português brasileiro
- Retorne APENAS o JSON puro, sem comentários`

    const preferred = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const fallbacks = [preferred, 'gemini-2.0-flash', 'gemini-1.5-flash']
    let response: Response | null = null
    let lastErrorText = ''
    for (const model of fallbacks) {
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048 },
        }),
      })
      if (response.ok) break
      lastErrorText = await response.text()
      console.warn(`⚠️ Falha com modelo ${model}:`, lastErrorText)
    }

    if (!response || !response.ok) {
      console.error('❌ Erro na API Gemini após fallbacks:', lastErrorText)
      return NextResponse.json({ error: 'Modelo indisponível no momento. Tente novamente.' }, { status: 502 })
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('❌ Resposta inválida da API Gemini:', data)
      return NextResponse.json(
        { error: 'Resposta inválida da IA' },
        { status: 500 }
      )
    }

    const generatedText = data.candidates[0].content.parts[0].text.trim()

    // Extrair JSON da resposta (pode vir com markdown ou texto adicional)
    let jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Se não encontrar JSON, tentar extrair do texto
      jsonMatch = generatedText.match(/```json\s*(\{[\s\S]*\})\s*```/) || generatedText.match(/\{[\s\S]*\}/)
    }

    if (!jsonMatch) {
      console.error('❌ Não foi possível extrair JSON da resposta:', generatedText)
      return NextResponse.json(
        { error: 'Formato de resposta inválido' },
        { status: 500 }
      )
    }

    const jsonString = jsonMatch[1] || jsonMatch[0]
    const parsed = JSON.parse(jsonString)

    // Validar estrutura
    if (!parsed.titles || !parsed.lead || !parsed.structure) {
      return NextResponse.json(
        { error: 'Estrutura de resposta incompleta' },
        { status: 500 }
      )
    }

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error('❌ Erro inesperado na API de sugestão:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

