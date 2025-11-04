// app/api/auth/request-reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { sendEmail, getResetPasswordEmailTemplate } from '@/lib/email-sender'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Usar Service Role Key para operações de admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Variáveis de ambiente ausentes: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json(
        { success: false, error: 'Configuração do servidor ausente' },
        { status: 500 }
      )
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. Verificar se o usuário existe em auth.users (tanto admins quanto maricultores)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Erro ao listar usuários:', listError)
      return NextResponse.json({ success: true, message: 'Se o email existir, um link foi enviado' })
    }

    const user = users?.find((u) => u.email === email)

    // Por segurança, sempre retornar sucesso mesmo que o email não exista
    if (!user) {
      console.log('📧 Email não encontrado, mas retornando sucesso por segurança')
      return NextResponse.json({ success: true, message: 'Se o email existir, um link foi enviado' })
    }

    // Verificar se é admin ou maricultor para buscar o nome
    let fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'
    
    // Tentar buscar nome na tabela users (admins)
    const { data: adminProfile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()
    
    if (adminProfile?.full_name) {
      fullName = adminProfile.full_name
    } else {
      // Tentar buscar nome na tabela maricultor_profiles
      const { data: maricultorProfile } = await supabase
        .from('maricultor_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      
      if (maricultorProfile?.full_name) {
        fullName = maricultorProfile.full_name
      }
    }

    // 2. Gerar token de recuperação (válido por 1 hora)
    const resetToken = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Expira em 1 hora

    // 3. Salvar token no user_metadata do Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          reset_token_hash: resetToken,
          reset_token_expires_at: expiresAt.toISOString()
        }
      }
    )

    if (updateError) {
      console.error('Erro ao salvar token de recuperação:', updateError)
      return NextResponse.json(
        { success: false, error: 'Erro ao processar solicitação' },
        { status: 500 }
      )
    }

    // 4. Gerar link de redefinição
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

    // 5. Enviar email diretamente (sem fetch)
    console.log('📧 Tentando enviar email para:', email)
    
    const emailTemplate = getResetPasswordEmailTemplate(resetLink)
    const emailResult = await sendEmail({
      to: email,
      subject: 'AMESP - Redefinição de Senha',
      html: emailTemplate
    })

    if (!emailResult.success) {
      console.error('❌ Erro ao enviar email:', emailResult.error, emailResult.details)
      return NextResponse.json(
        { success: false, error: 'Erro ao enviar email', details: emailResult.details },
        { status: 500 }
      )
    }

    console.log('✅ Email de redefinição de senha enviado para:', email, '| MessageID:', emailResult.messageId)
    return NextResponse.json({ 
      success: true, 
      message: 'Email enviado com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao processar solicitação de redefinição:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

