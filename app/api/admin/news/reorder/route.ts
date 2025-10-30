import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { updates } = await req.json()
    if (!Array.isArray(updates) || updates.length === 0) return NextResponse.json({ error: 'updates vazio' }, { status: 400 })
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    for (const u of updates) {
      if (!u?.id || typeof u.display_order !== 'number') continue
      const { error } = await supabase.from('news').update({ display_order: u.display_order }).eq('id', u.id)
      if (error) throw error
    }
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro' }, { status: 500 })
  }
}


