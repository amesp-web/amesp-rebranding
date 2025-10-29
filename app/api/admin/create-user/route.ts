// app/api/admin/create-user/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { full_name, email, phone, role } = await request.json()
    console.log('🚀 API: Criando usuário:', { full_name, email, phone, role })

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

    // Gerar senha temporária
    const tempPassword = generateTemporaryPassword()
    console.log('🔑 Senha temporária gerada:', tempPassword)

    // Criar usuário
    console.log('👤 Criando usuário no auth...')
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        phone
      }
    })

    if (error) {
      console.error('❌ Erro ao criar usuário:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('✅ Usuário criado no auth:', data.user.id)

    // Criar perfil admin com TODOS os campos
    console.log('👨‍💼 Criando perfil admin...')
    const { error: profileError } = await supabase
      .from('admin_profiles')
      .insert({
        id: data.user.id,
        full_name,
        email: email,
        phone: phone,
        role,
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: null
      })

    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError)
      // Se falhou ao criar o perfil, tentar excluir o usuário do auth para manter consistência
      console.log('🧹 Tentando limpar usuário do auth devido ao erro...')
      await supabase.auth.admin.deleteUser(data.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    console.log('✅ Perfil admin criado com sucesso!')

    // Verificar se o perfil foi realmente criado
    console.log('🔍 Verificando se o perfil foi criado...')
    const { data: checkProfile, error: checkError } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (checkError || !checkProfile) {
      console.error('❌ Perfil não foi criado corretamente:', checkError)
      return NextResponse.json({ error: 'Erro ao verificar criação do perfil' }, { status: 400 })
    }

    console.log('✅ Perfil verificado com sucesso:', checkProfile.full_name)

    return NextResponse.json({ 
      success: true, 
      user: data.user,
      profile: checkProfile,
      tempPassword 
    })

  } catch (error: any) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
