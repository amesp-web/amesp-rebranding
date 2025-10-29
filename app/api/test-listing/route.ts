// app/api/test-listing/route.ts - API de teste para verificar listagem
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('🧪 TESTE: Verificando listagem de usuários...')
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Configuração do Supabase não encontrada' }, { status: 500 })
    }

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

    // 1. Contar admin_profiles
    const { data: adminProfiles, error: profileError } = await supabase
      .from('admin_profiles')
      .select('id, full_name, created_at')
      .order('created_at', { ascending: false })

    if (profileError) {
      console.error('❌ Erro ao buscar admin_profiles:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    console.log('📋 Admin profiles encontrados:', adminProfiles?.length || 0)
    console.log('📋 Dados:', adminProfiles)

    // 2. Contar auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Erro ao buscar auth.users:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    console.log('👥 Auth users encontrados:', authUsers?.users?.length || 0)

    // 3. Verificar consistência
    const adminIds = adminProfiles?.map(p => p.id) || []
    const authIds = authUsers?.users?.map(u => u.id) || []
    
    const missingInAuth = adminIds.filter(id => !authIds.includes(id))
    const missingInAdmin = authIds.filter(id => !adminIds.includes(id))

    console.log('🔍 IDs em admin_profiles:', adminIds)
    console.log('🔍 IDs em auth.users:', authIds)
    console.log('⚠️ IDs em admin_profiles mas não em auth.users:', missingInAuth)
    console.log('⚠️ IDs em auth.users mas não em admin_profiles:', missingInAdmin)

    return NextResponse.json({
      admin_profiles: {
        count: adminProfiles?.length || 0,
        data: adminProfiles
      },
      auth_users: {
        count: authUsers?.users?.length || 0,
        data: authUsers?.users?.map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at
        }))
      },
      consistency: {
        admin_ids: adminIds,
        auth_ids: authIds,
        missing_in_auth: missingInAuth,
        missing_in_admin: missingInAdmin,
        is_consistent: missingInAuth.length === 0 && missingInAdmin.length === 0
      }
    })

  } catch (error: any) {
    console.error('❌ Erro no teste:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
