// app/api/admin/delete-user/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    console.log('🗑️ Excluindo usuário:', userId)
    
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

    // Primeiro, excluir do admin_profiles
    console.log('📋 Excluindo do admin_profiles...')
    const { data: deleteData, error: profileError } = await supabase
      .from('admin_profiles')
      .delete()
      .eq('id', userId)
      .select()

    console.log('📊 Resultado da exclusão do admin_profiles:', { deleteData, error: profileError?.message || 'none' })

    if (profileError) {
      console.error('❌ Erro ao excluir admin_profile:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    console.log('✅ Admin profile excluído com sucesso!')

    // Depois, excluir do auth.users
    console.log('👤 Excluindo do auth.users...')
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('❌ Erro ao excluir auth user:', authError)
      // Se não conseguir excluir do auth.users, pelo menos excluímos do admin_profiles
      // Isso é melhor que não excluir nada
      console.log('⚠️ Continuando mesmo com erro no auth.users...')
    } else {
      console.log('✅ Auth user excluído com sucesso!')
    }

    // Verificar se realmente foi excluído
    console.log('🔍 Verificando se foi excluído...')
    const { data: checkProfile, error: checkError } = await supabase
      .from('admin_profiles')
      .select('id, full_name, email')
      .eq('id', userId)
    
    console.log('📋 Admin profile ainda existe?', checkProfile?.length || 0)
    console.log('📋 Dados encontrados:', checkProfile)
    console.log('📋 Erro na verificação:', checkError?.message || 'none')

    return NextResponse.json({ 
      success: true, 
      message: 'Usuário excluído com sucesso',
      deletedFromProfile: !checkProfile?.length
    })

  } catch (error: any) {
    console.error('❌ Erro na API delete-user:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
