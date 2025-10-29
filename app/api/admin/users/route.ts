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

    // Normalizar last_sign_in_at e adicionar flag has_logged_in
    const normalized = (data || []).map((u: any) => {
      const raw = u.last_sign_in_at as string | null
      const iso = raw ? raw.replace(' ', 'T') : null
      const result = {
        ...u,
        last_sign_in_at: iso,
        has_logged_in: Boolean(raw),
      }
      
      // Log específico para Grah Duetes
      if (u.email === 'graziely@gobi.consulting') {
        console.log('🔍 NORMALIZAÇÃO GRAH DUETES:')
        console.log('  - Raw last_sign_in_at:', raw)
        console.log('  - ISO last_sign_in_at:', iso)
        console.log('  - has_logged_in:', Boolean(raw))
        console.log('  - Resultado final:', result)
      }
      
      return result
    })

    console.log('✅ Retornando usuários:', normalized.length)
    console.log('📋 Dados normalizados finais:', normalized)
    return NextResponse.json(
      { users: normalized },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    )
  } catch (error: any) {
    console.error('❌ Erro na API users:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}