import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data, error } = await supabase
      .from('events')
    .select('id, title, description, banner_url, location, schedule, stands, participants, sponsors, live_url, signup_url, display_order, created_at, published')
    .eq('published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data ?? [], { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    console.error('Erro ao listar eventos públicos:', e)
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}


