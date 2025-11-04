// app/api/admin/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// GET - Listar notificações
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const onlyUnread = searchParams.get('unread') === 'true'

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Configuração ausente' },
        { status: 500 }
      )
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(50)

    if (onlyUnread) {
      query = query.eq('is_read', false)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Erro ao buscar notificações:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Contar não lidas
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      unread: unreadCount || 0
    })

  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}

// POST - Criar notificação
export async function POST(request: NextRequest) {
  try {
    const { type, title, message, link, icon, priority, metadata } = await request.json()

    if (!type || !title) {
      return NextResponse.json(
        { success: false, error: 'Tipo e título são obrigatórios' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Configuração ausente' },
        { status: 500 }
      )
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        type,
        title,
        message,
        link,
        icon: icon || 'Bell',
        priority: priority || 'normal',
        metadata: metadata || null
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar notificação:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}

// PATCH - Marcar como lida
export async function PATCH(request: NextRequest) {
  try {
    const { id, is_read, markAllAsRead } = await request.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Configuração ausente' },
        { status: 500 }
      )
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)

    if (markAllAsRead) {
      // Marcar todas como lidas
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('is_read', false)

      if (error) {
        console.error('Erro ao marcar todas como lidas:', error)
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    // Marcar uma notificação específica
    const updateData: any = {
      is_read,
      updated_at: new Date().toISOString()
    }

    if (is_read) {
      updateData.read_at = new Date().toISOString()
    } else {
      updateData.read_at = null
    }

    const { error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar notificação:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}

