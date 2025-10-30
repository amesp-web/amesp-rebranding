import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data, error } = await supabase.from('events').select('*').eq('id', params.id).single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    const { error } = await supabase.from('events').update({
      title: body.title,
      description: body.description,
      banner_url: body.banner_url,
      photo_url: body.photo_url,
      location: body.location,
      live_url: body.live_url,
      signup_url: body.signup_url,
      schedule: body.schedule || [],
      stands: body.stands || [],
      participants: body.participants || [],
      sponsors: body.sponsors || [],
      published: !!body.published,
      updated_at: new Date().toISOString(),
    }).eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}


