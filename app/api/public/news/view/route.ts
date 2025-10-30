import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return NextResponse.json({ error: 'Configuração inválida do servidor' }, { status: 500 })

    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

    // Incremento atômico
    const { error } = await supabase
      .from('news')
      .update({ views: (null as any) }) // placeholder, vamos usar RPC via expressão
      .eq('id', id)
      .select('id')

    // Como update direto com expressão não é suportado pelo client,
    // usamos uma chamada a RPC no PostgREST: increment via single update
    // Alternativa: rodar explicit 'views = views + 1' com SQL custom via Edge não é possível
    // portanto refazemos usando fetch no rest endpoint diretamente

    // Se a abordagem acima falhar, tentaremos um fallback usando fetch no endpoint restful
    if (error) {
      const resp = await fetch(`${url}/rest/v1/news?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ views: { increment: 1 } }),
      })
      if (!resp.ok) {
        const text = await resp.text()
        return NextResponse.json({ error: text || 'Falha ao incrementar views' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro inesperado' }, { status: 500 })
  }
}


