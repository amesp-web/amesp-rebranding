// app/api/debug/users/route.ts - API de debug para verificar usuários
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('🔍 DEBUG: Verificando usuários no banco...')
    
    // Criar cliente Supabase com service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 1. Verificar admin_profiles
    console.log('📋 1. Verificando admin_profiles...')
    const { data: adminProfiles, error: profileError } = await supabase
      .from('admin_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('📋 Admin profiles:', adminProfiles?.length || 0)
    console.log('📋 Dados admin_profiles:', JSON.stringify(adminProfiles, null, 2))

    // 2. Verificar auth.users
    console.log('👥 2. Verificando auth.users...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    console.log('👥 Auth users:', authUsers?.users?.length || 0)
    console.log('👥 Dados auth.users:', JSON.stringify(authUsers?.users?.map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at
    })), null, 2))

    // 3. Verificar se há inconsistências
    const adminIds = adminProfiles?.map(p => p.id) || []
    const authIds = authUsers?.users?.map(u => u.id) || []
    
    console.log('🔍 IDs em admin_profiles:', adminIds)
    console.log('🔍 IDs em auth.users:', authIds)
    
    const missingInAuth = adminIds.filter(id => !authIds.includes(id))
    const missingInAdmin = authIds.filter(id => !adminIds.includes(id))
    
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
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at
        }))
      },
      inconsistencies: {
        missing_in_auth: missingInAuth,
        missing_in_admin: missingInAdmin
      }
    })

  } catch (error: any) {
    console.error('❌ Erro no debug:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
