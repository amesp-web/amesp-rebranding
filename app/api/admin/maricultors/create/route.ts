import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email-sender'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { full_name, email, cpf, phone, cep, logradouro, cidade, estado, company, specialties } = body

    // Validações
    if (!full_name || !email || !cpf) {
      return NextResponse.json(
        { error: 'Nome, email e CPF são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar CPF (11 dígitos)
    const cpfDigits = String(cpf).replace(/\D/g, '')
    if (cpfDigits.length !== 11) {
      return NextResponse.json(
        { error: 'CPF inválido' },
        { status: 400 }
      )
    }

    // Gerar senha: 6 primeiros dígitos do CPF
    const password = cpfDigits.substring(0, 6)

    // Criar cliente Supabase com Service Role Key (admin)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. Criar usuário no auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        name: full_name,
        phone,
        company,
        specialties,
        user_type: "maricultor",
        cpf: cpfDigits
      }
    })

    if (authError) {
      console.error('Erro ao criar usuário:', authError)
      return NextResponse.json(
        { error: authError.message || 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    const userId = authData.user.id

    // 2. Criar perfil em maricultor_profiles
    const { error: profileError } = await supabase
      .from('maricultor_profiles')
      .insert({
        id: userId,
        full_name,
        phone,
        logradouro,
        cidade,
        estado,
        cep,
        company,
        specialties,
        is_active: true
      })

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
      
      // Rollback: deletar usuário criado
      await supabase.auth.admin.deleteUser(userId)
      
      return NextResponse.json(
        { error: 'Erro ao criar perfil do maricultor' },
        { status: 500 }
      )
    }

    // 3. Enviar email de boas-vindas com as credenciais
    try {
      await sendEmail({
        to: email,
        subject: 'Bem-vindo à AMESP - Credenciais de Acesso',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
                <h1 style="color: #0891b2; margin: 0 0 20px 0; font-size: 28px;">Bem-vindo à AMESP!</h1>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Olá <strong>${full_name}</strong>,
                </p>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Seu cadastro foi realizado com sucesso pela equipe administrativa da AMESP. 
                  Abaixo estão suas credenciais de acesso à plataforma:
                </p>
                
                <div style="background: #f1f5f9; border-left: 4px solid #0891b2; padding: 20px; margin: 24px 0; border-radius: 8px;">
                  <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;"><strong>Email:</strong></p>
                  <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px;">${email}</p>
                  
                  <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;"><strong>Senha:</strong></p>
                  <p style="margin: 0; color: #1e293b; font-size: 16px; font-family: monospace;">${password}</p>
                </div>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  <strong>Recomendação:</strong> Após o primeiro acesso, altere sua senha em "Meu Perfil" para maior segurança.
                </p>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://amesp-rebranding.vercel.app'}/login" 
                     style="display: inline-block; background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                    Acessar Plataforma
                  </a>
                </div>
                
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                  Atenciosamente,<br>
                  <strong>Equipe AMESP</strong>
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    } catch (emailError) {
      console.error('Erro ao enviar email (não crítico):', emailError)
    }

    // 4. Criar notificação
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'maricultor',
          title: `Novo maricultor cadastrado: ${full_name}`,
          message: `Cadastrado via admin • Email: ${email} • Cidade: ${cidade || 'Não informada'}`,
          link: null,
          icon: 'UserPlus',
          priority: 'normal',
          metadata: {
            maricultor_id: userId,
            email,
            city: cidade,
            company,
            created_by_admin: true
          }
        })
      })
    } catch (notifError) {
      console.error('Erro ao criar notificação (não crítico):', notifError)
    }

    return NextResponse.json({
      success: true,
      message: 'Maricultor cadastrado com sucesso',
      maricultor_id: userId
    })

  } catch (error: any) {
    console.error('Erro ao cadastrar maricultor:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao cadastrar maricultor' },
      { status: 500 }
    )
  }
}

