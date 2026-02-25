import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPushToTopic } from '@/lib/push'

export async function POST(req: Request) {
  try {
    const { id, published } = await req.json()
    if (!id || typeof published !== 'boolean') return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    const { error } = await supabase.from('news').update({ published }).eq('id', id)
    if (error) throw error

    if (published) {
      const { data: news } = await supabase.from('news').select('title, excerpt').eq('id', id).single()
      if (news?.title) {
        const body = (news.excerpt || '').slice(0, 70) + ((news.excerpt || '').length > 70 ? '…' : '')
        sendPushToTopic('news', {
          title: 'Nova notícia: ' + news.title,
          body: body || 'Confira no app.',
          url: '/news',
        }).catch((err) => console.error('[push] news toggle:', err))
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro' }, { status: 500 })
  }
}


