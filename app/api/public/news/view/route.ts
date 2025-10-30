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

    // Estratégia simples e confiável: ler e escrever o novo valor
    const { data: row, error: readErr } = await supabase
      .from('news')
      .select('views')
      .eq('id', id)
      .single()
    if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 })

    const nextViews = (row?.views || 0) + 1
    const { error: updErr } = await supabase
      .from('news')
      .update({ views: nextViews })
      .eq('id', id)
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

    return NextResponse.json({ success: true, views: nextViews })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro inesperado' }, { status: 500 })
  }
}


