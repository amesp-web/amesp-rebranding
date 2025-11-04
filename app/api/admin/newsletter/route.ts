// app/api/admin/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Configuração ausente' },
        { status: 500 }
      )
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)

    // Buscar todos os inscritos
    const { data, error, count } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .order('subscribed_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar inscritos:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Estatísticas
    const { count: activeCount } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      active: activeCount || 0
    })

  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}

// Ativar/Desativar inscrito
export async function PATCH(request: NextRequest) {
  try {
    const { id, is_active } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID é obrigatório' },
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

    const updateData: any = {
      is_active,
      updated_at: new Date().toISOString()
    }

    // Se estiver desativando, salvar data
    if (!is_active) {
      updateData.unsubscribed_at = new Date().toISOString()
    } else {
      updateData.unsubscribed_at = null
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar inscrito:', error)
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

