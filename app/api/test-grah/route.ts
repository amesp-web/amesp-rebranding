// API de teste simples para verificar dados específicos
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('🧪 TESTE SIMPLES: Buscando dados do Grah Duetes...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { 
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { 'Cache-Control': 'no-cache' } }
      }
    )

    // Buscar APENAS o usuário Grah Duetes
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('id, full_name, email, last_sign_in_at, is_active')
      .eq('email', 'graziely@gobi.consulting')
      .single()

    if (error) {
      console.error('❌ Erro:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('📊 Dados brutos do banco:', data)

    // Normalizar exatamente como a API principal faz
    const normalized = {
      ...data,
      last_sign_in_at: data.last_sign_in_at ? data.last_sign_in_at.replace(' ', 'T') : null,
      has_logged_in: Boolean(data.last_sign_in_at),
    }

    console.log('🔄 Dados normalizados:', normalized)

    return NextResponse.json({ 
      raw: data,
      normalized: normalized,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })

  } catch (error: any) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
