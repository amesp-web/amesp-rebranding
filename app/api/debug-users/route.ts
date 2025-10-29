// API de debug para verificar dados dos usuários
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('🔍 DEBUG: Iniciando busca de usuários...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { 
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { 'Cache-Control': 'no-cache' } }
      }
    )

    // Buscar dados brutos da tabela
    const { data: rawData, error: rawError } = await supabase
      .from('admin_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (rawError) {
      console.error('❌ Erro na query raw:', rawError)
      return NextResponse.json({ error: rawError.message }, { status: 500 })
    }

    console.log('📊 Dados brutos da tabela:', rawData)

    // Buscar dados específicos do usuário Grah Duetes
    const { data: grahData, error: grahError } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('email', 'graziely@gobi.consulting')
      .single()

    console.log('👤 Dados específicos do Grah Duetes:', grahData)
    console.log('❌ Erro específico:', grahError)

    // Log detalhado dos campos importantes
    if (grahData) {
      console.log('🔍 CAMPOS IMPORTANTES DO GRAH DUETES:')
      console.log('  - last_sign_in_at:', grahData.last_sign_in_at)
      console.log('  - is_active:', grahData.is_active)
      console.log('  - email_confirmed_at:', grahData.email_confirmed_at)
      console.log('  - updated_at:', grahData.updated_at)
      console.log('  - Tipo de last_sign_in_at:', typeof grahData.last_sign_in_at)
      console.log('  - É null?', grahData.last_sign_in_at === null)
      console.log('  - É undefined?', grahData.last_sign_in_at === undefined)
    }

    return NextResponse.json({ 
      rawData,
      grahData,
      grahError: grahError?.message,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
