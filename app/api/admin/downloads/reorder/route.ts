import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { items } = await request.json()

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array é obrigatório' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ Variáveis de ambiente do Supabase ausentes.')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Atualizar a ordem de cada item
    const updates = items.map((item: { id: string; display_order: number }) =>
      supabase
        .from('downloads')
        .update({ display_order: item.display_order })
        .eq('id', item.id)
    )

    const results = await Promise.all(updates)

    // Verificar se algum update falhou
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error('❌ Erros ao reordenar downloads:', errors)
      return NextResponse.json({ error: 'Erro ao reordenar alguns itens' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Erro inesperado ao reordenar downloads:', error)
    return NextResponse.json({ error: error.message || 'Erro inesperado' }, { status: 500 })
  }
}

