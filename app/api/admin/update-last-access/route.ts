// API para atualizar último acesso diretamente
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    console.log('🔄 Atualizando último acesso para:', email)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { 
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { 'Cache-Control': 'no-cache' } }
      }
    )

    // Primeiro, buscar o usuário atual para ver o estado
    const { data: beforeData } = await supabase
      .from('admin_profiles')
      .select('id, full_name, email, last_sign_in_at, is_active')
      .eq('email', email)
      .single()

    console.log('📊 Estado ANTES da atualização:', beforeData)

    // Atualizar diretamente com timestamp específico
    const now = new Date().toISOString()
    console.log('🕐 Timestamp a ser usado:', now)

    const { data: updateData, error: updateError } = await supabase
      .from('admin_profiles')
      .update({ 
        last_sign_in_at: now,
        updated_at: now
      })
      .eq('email', email)
      .select('id, full_name, email, last_sign_in_at, is_active')

    if (updateError) {
      console.error('❌ Erro ao atualizar:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log('✅ Dados após UPDATE:', updateData)

    // Aguardar um pouco e buscar novamente para confirmar
    await new Promise(resolve => setTimeout(resolve, 100))

    const { data: afterData, error: afterError } = await supabase
      .from('admin_profiles')
      .select('id, full_name, email, last_sign_in_at, is_active')
      .eq('email', email)
      .single()

    console.log('✅ Estado APÓS atualização (verificação):', afterData)
    console.log('❌ Erro na verificação:', afterError)

    const finalUser = afterData || updateData?.[0]

    console.log('✅ Último acesso atualizado. Dados finais:', finalUser)

    return NextResponse.json({ 
      success: true,
      user: finalUser,
      before: beforeData,
      after: afterData,
      message: 'Último acesso atualizado com sucesso'
    })

  } catch (error: any) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
