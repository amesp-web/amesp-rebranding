import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
  try {
    const { items } = await req.json()
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Items deve ser um array' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

    // Atualizar display_order de todos os itens
    const updates = items.map((item: { id: string; display_order: number }) => ({
      id: item.id,
      display_order: item.display_order,
    }))

    for (const update of updates) {
      const { error } = await supabase
        .from('projects')
        .update({ display_order: update.display_order })
        .eq('id', update.id)
      
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}

