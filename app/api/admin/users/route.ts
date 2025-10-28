// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Verificar se as variáveis estão configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Variáveis de ambiente não configuradas:', {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      })
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

    // Buscar todos os admins
    const { data: adminProfiles, error: profileError } = await supabase
      .from('admin_profiles')
      .select('id, full_name, role, created_at')

    if (profileError) {
      console.error('Erro ao buscar admin_profiles:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // Para cada admin, buscar dados do auth.users
    const usersWithAuthData = await Promise.all(
      adminProfiles.map(async (profile) => {
        const { data: authData } = await supabase.auth.admin.getUserById(profile.id)
        
        return {
          id: profile.id,
          email: authData?.user?.email || '',
          full_name: profile.full_name,
          phone: authData?.user?.user_metadata?.phone || '',
          role: profile.role,
          created_at: profile.created_at,
          last_sign_in_at: authData?.user?.last_sign_in_at,
          email_confirmed_at: authData?.user?.email_confirmed_at
        }
      })
    )

    return NextResponse.json({ users: usersWithAuthData })

  } catch (error: any) {
    console.error('Erro na API de usuários:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
