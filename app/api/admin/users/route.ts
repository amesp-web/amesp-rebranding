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
    // Query direta SEM RPC
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('📊 Resultado:', { data: data?.length || 0, error: error?.message || 'none' })

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