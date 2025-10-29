// app/api/admin/users/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('🔍 Iniciando busca de usuários...')
    console.log('🔑 SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING')
    console.log('🔑 SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { 
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { 'Cache-Control': 'no-cache' } }
      }
    )

    console.log('📋 Executando query...')
    // Query direta SEM RPC - selecionando campos específicos incluindo is_active
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('id, full_name, email, phone, role, is_active, email_confirmed_at, last_sign_in_at, created_at, updated_at')
      .order('created_at', { ascending: false })

    console.log('📊 Resultado:', { data: data?.length || 0, error: error?.message || 'none' })
    
    // Log detalhado dos dados retornados
    if (data && data.length > 0) {
      console.log('📋 Dados detalhados dos usuários:')
      data.forEach((user, index) => {
        console.log(`👤 Usuário ${index + 1}:`, {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          last_sign_in_at: user.last_sign_in_at,
          is_active: user.is_active
        })
      })
    }

    if (error) {
      console.error('❌ Erro na query:', error)
      throw error
    }

    console.log('✅ Retornando usuários:', data?.length || 0)
    return NextResponse.json({ users: data || [] })
  } catch (error: any) {
    console.error('❌ Erro na API users:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}