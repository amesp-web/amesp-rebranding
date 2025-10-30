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
    const { data: content } = await supabase.from('about_content').select('*').order('id', { ascending: true }).limit(1).single()
    const { data: features } = await supabase.from('about_features').select('*').order('display_order', { ascending: true })
    return NextResponse.json({ content, features })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const supabase = getService()
    // upsert single row for content
    if (payload?.content) {
      const { title, subtitle } = payload.content
      await supabase.from('about_content').upsert({ id: 1, title, subtitle, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    }
    if (Array.isArray(payload?.features)) {
      for (let i = 0; i < payload.features.length; i++) {
        const f = payload.features[i]
        await supabase.from('about_features').upsert({ id: f.id, title: f.title, description: f.description, icon_key: f.icon_key, display_order: i })
      }
    }
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}


