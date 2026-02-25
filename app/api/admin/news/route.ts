import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPushToTopic } from '@/lib/push'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

    const rawText: string = String(body.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const excerpt = (body.excerpt || rawText.slice(0, 200)).trim()
    const slug = (body.slug || String(body.title || '')
      .toLowerCase()
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 80)).replace(/-+/g, '-')

    const payload: any = {
      title: body.title,
      content: body.content,
      image_url: body.image_url || null,
      published: body.published ?? true,
      excerpt,
      slug,
      category: body.category || 'Geral',
      likes: 0,
      views: 0,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from('news').insert(payload).select().single()
    if (error) throw error

    if (data?.published && data.title) {
      sendPushToTopic('news', {
        title: 'Nova notícia: ' + data.title,
        body: excerpt.slice(0, 70) + (excerpt.length > 70 ? '…' : ''),
        url: '/news',
      }).catch((err) => console.error('[push] news:', err))
    }

    return NextResponse.json({ success: true, news: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro' }, { status: 500 })
  }
}


