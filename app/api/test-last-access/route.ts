// Script de teste para verificar atualização do último acesso
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json()
    
    console.log('🧪 Testando atualização do último acesso...')
    console.log('👤 User ID:', userId)
    console.log('📧 Email:', email)
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { 
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { 'Cache-Control': 'no-cache' } }
      }
    )

    // Primeiro, verificar o estado atual
    const { data: currentData, error: currentError } = await supabase
      .from('admin_profiles')
      .select('id, full_name, email, last_sign_in_at, updated_at')
      .eq('id', userId)
      .single()

    if (currentError) {
      console.error('❌ Erro ao buscar dados atuais:', currentError)
      return NextResponse.json({ error: currentError.message }, { status: 500 })
    }

    console.log('📊 Estado atual:', currentData)

    // Atualizar o último acesso
    const { data: updateData, error: updateError } = await supabase
      .from('admin_profiles')
      .update({ 
        last_sign_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, full_name, email, last_sign_in_at, updated_at')

    if (updateError) {
      console.error('❌ Erro ao atualizar:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log('✅ Dados após atualização:', updateData)

    return NextResponse.json({ 
      success: true, 
      before: currentData,
      after: updateData?.[0]
    })

  } catch (error: any) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
