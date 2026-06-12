import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ Variáveis de ambiente do Supabase ausentes.')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data: downloads, error } = await supabase
      .from('downloads')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar downloads:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(downloads || [], {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (error: any) {
    console.error('❌ Erro inesperado na API de downloads:', error)
    return NextResponse.json({ error: error.message || 'Erro inesperado' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, file_url, file_name, file_size, cover_url, cover_file_name } = body

    if (!title || !file_url || !file_name) {
      return NextResponse.json(
        { error: 'Título, arquivo e nome do arquivo são obrigatórios' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ Variáveis de ambiente do Supabase ausentes.')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Buscar a maior ordem atual
    const { data: maxOrderData } = await supabase
      .from('downloads')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = (maxOrderData?.[0]?.display_order || 0) + 1

    const { data, error } = await supabase
      .from('downloads')
      .insert({
        title,
        description: description || null,
        file_url,
        file_name,
        file_size: file_size || null,
        cover_url: cover_url || null,
        cover_file_name: cover_file_name || null,
        display_order: nextOrder,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar download:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('❌ Erro inesperado ao criar download:', error)
    return NextResponse.json({ error: error.message || 'Erro inesperado' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, description, cover_url, cover_file_name } = body

    if (!id || !title) {
      return NextResponse.json(
        { error: 'ID e título são obrigatórios' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ Variáveis de ambiente do Supabase ausentes.')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const updatePayload: Record<string, unknown> = {
      title,
      description: description || null,
      updated_at: new Date().toISOString(),
    }

    if (cover_url !== undefined) {
      updatePayload.cover_url = cover_url || null
      updatePayload.cover_file_name = cover_file_name || null
    }

    const { data, error } = await supabase
      .from('downloads')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar download:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Erro inesperado ao atualizar download:', error)
    return NextResponse.json({ error: error.message || 'Erro inesperado' }, { status: 500 })
  }
}

