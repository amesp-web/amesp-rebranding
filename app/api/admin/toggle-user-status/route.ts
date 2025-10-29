// app/api/admin/toggle-user-status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { userId, currentStatus } = await request.json()
    
    console.log('🔄 Alterando status do usuário:', userId, 'de', currentStatus)
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Configuração do Supabase não encontrada' }, { status: 500 })
    }

    // Criar cliente Supabase com service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Determinar novo status
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const emailConfirmedAt = newStatus === 'active' ? new Date().toISOString() : null
    const isActive = newStatus === 'active'
    
    console.log('📧 Novo status:', newStatus, 'is_active:', isActive, 'email_confirmed_at:', emailConfirmedAt)

    // Atualizar usuário no auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: newStatus === 'active',
      email_confirmed_at: emailConfirmedAt
    })

    if (authError) {
      console.error('❌ Erro ao atualizar auth:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    console.log('✅ Usuário atualizado no auth:', authData?.user?.email)

    // Atualizar também na tabela admin_profiles para manter consistência
    const { error: profileError } = await supabase
      .from('admin_profiles')
      .update({ 
        is_active: isActive,
        email_confirmed_at: emailConfirmedAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.error('❌ Erro ao atualizar admin_profiles:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    console.log('✅ Perfil admin atualizado:', userId)

    return NextResponse.json({ 
      success: true, 
      user: authData?.user,
      newStatus: newStatus
    })

  } catch (error: any) {
    console.error('❌ Erro na API toggle-user-status:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
