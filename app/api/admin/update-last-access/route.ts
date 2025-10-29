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

    // Atualizar diretamente
    const { data, error } = await supabase
      .from('admin_profiles')
      .update({ 
        last_sign_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select('id, full_name, email, last_sign_in_at, is_active')

    if (error) {
      console.error('❌ Erro ao atualizar:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Último acesso atualizado:', data)

    return NextResponse.json({ 
      success: true,
      user: data?.[0],
      message: 'Último acesso atualizado com sucesso'
    })

  } catch (error: any) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
