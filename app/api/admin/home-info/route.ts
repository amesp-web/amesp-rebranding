import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not set')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET() {
  try {
    const supabase = getService()
    const { data, error } = await supabase
      .from('home_info')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (e: any) {
    console.error('Erro ao buscar home info:', e)
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json()
    const supabase = getService()

    const { data, error } = await supabase
      .from('home_info')
      .update({
        badge_text: payload.badge_text,
        title: payload.title,
        description: payload.description,
        hero_image_url: payload.hero_image_url,
        sustainability_tag: payload.sustainability_tag,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (e: any) {
    console.error('Erro ao atualizar home info:', e)
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}

