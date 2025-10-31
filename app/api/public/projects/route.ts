import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    
    // Buscar apenas projetos publicados para o menu
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, slug, submenu_label, display_order')
      .eq('published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return NextResponse.json(data || [])
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}

