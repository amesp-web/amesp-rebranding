import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPushToTopic } from '@/lib/push'

export async function POST(req: Request) {
  try {
    const { id, published } = await req.json()
    if (!id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    const { error } = await supabase.from('events').update({ published: !!published }).eq('id', id)
    if (error) throw error

    if (published) {
      const { data: event } = await supabase
        .from('events')
        .select('title, description')
        .eq('id', id)
        .single()

      if (event?.title) {
        const rawText: string = String(event.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        const excerpt = rawText.slice(0, 120)
        const bodyText = excerpt.slice(0, 70) + (excerpt.length > 70 ? '…' : '')

        sendPushToTopic('events', {
          title: 'Novo evento: ' + event.title,
          body: bodyText || 'Confira os detalhes do evento no app.',
          url: '/#eventos',
        }).catch((err) => console.error('[push] events toggle:', err))
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}


