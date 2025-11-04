// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email, tempPassword, userName, type, resetLink } = await request.json()

    // Verificar se as configurações do Gmail estão disponíveis
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      console.log('📧 EMAIL SIMULADO (Gmail não configurado):')
      console.log('Para:', email)
      if (tempPassword) console.log('Senha temporária:', tempPassword)
      if (resetLink) console.log('Link de redefinição:', resetLink)
      return NextResponse.json({ success: true, message: 'E-mail simulado enviado' })
    }

    // Configurar transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    })

    // Determinar qual template usar baseado no tipo
    let html: string
    let subject: string

    if (type === 'reset-password') {
      // Template de redefinição de senha (usando o template HTML do arquivo)
      html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinir Senha - AMESP</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);">
                  
                  <tr>
                    <td style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%); padding: 40px 30px; text-align: center;">
                      <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; max-width: 300px; margin: 0 auto; display: inline-block;">
                        <div style="font-size: 32px; font-weight: bold; color: #0ea5e9; text-align: center; letter-spacing: 2px;">
                          AMESP
                        </div>
                        <div style="font-size: 12px; color: #64748b; text-align: center; margin-top: 4px;">
                          Associação dos Maricultores do Estado de São Paulo
                        </div>
                      </div>
                      <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 16px 0 0 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                        Redefinição de Senha
                      </h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Olá,
                      </p>
                      
                      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Recebemos uma solicitação para redefinir a senha da sua conta AMESP.
                      </p>
                      
                      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Clique no botão abaixo para criar uma nova senha:
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 0 0 30px 0;">
                            <a href="${resetLink}" 
                               style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);">
                              🔐 Redefinir Minha Senha
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0;">
                          <strong>⚠️ Importante:</strong><br>
                          Este link é válido por <strong>1 hora</strong>. Se você não solicitou esta redefinição, ignore este email - sua senha permanecerá inalterada.
                        </p>
                      </div>

                      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                        Se o botão acima não funcionar, copie e cole este link no seu navegador:
                      </p>
                      
                      <p style="background-color: #f1f5f9; padding: 12px; border-radius: 8px; word-break: break-all; font-size: 12px; color: #475569; margin: 0 0 30px 0;">
                        ${resetLink}
                      </p>

                      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />

                      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                        Atenciosamente,<br>
                        <strong style="color: #0ea5e9;">Equipe AMESP</strong><br>
                        <span style="font-size: 12px;">Associação dos Maricultores do Estado de São Paulo</span>
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0;">
                        Este é um email automático, por favor não responda.
                      </p>
                      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        © 2025 AMESP - Todos os direitos reservados.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
      subject = 'AMESP - Redefinição de Senha'
    } else {
      // Template de boas-vindas (padrão)
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>AMESP - Boas-vindas</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .password-box { background: #1e293b; color: #0ea5e9; padding: 20px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .button { background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .steps { background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .step { margin: 10px 0; padding: 10px; background: white; border-radius: 6px; border-left: 4px solid #0ea5e9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="text-align: center; padding: 20px 0;">
                <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; max-width: 300px; margin: 0 auto; display: inline-block;">
                  <div style="font-size: 32px; font-weight: bold; color: #0ea5e9; text-align: center; letter-spacing: 2px;">
                    AMESP
                  </div>
                  <div style="font-size: 12px; color: #64748b; text-align: center; margin-top: 4px;">
                    Associação dos Maricultores do Estado de São Paulo
                  </div>
                </div>
              </div>
            </div>
            <div class="content">
              <h2>Bem-vindo, ${userName}!</h2>
              <p>Seu acesso ao sistema administrativo da AMESP foi criado com sucesso. Estamos felizes em tê-lo conosco!</p>
              
              <div class="password-box">
                ${tempPassword}
              </div>
              
              <div class="warning">
                <strong>🔐 Importante:</strong> Esta é uma senha temporária. Você será obrigado a alterá-la no primeiro login por motivos de segurança.
              </div>
              
              <div class="steps">
                <h3>Como acessar o sistema:</h3>
                <div class="step">
                  <strong>1.</strong> Acesse: <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login">${process.env.NEXT_PUBLIC_SITE_URL}/login</a>
                </div>
                <div class="step">
                  <strong>2.</strong> Use seu e-mail: <strong>${email}</strong>
                </div>
                <div class="step">
                  <strong>3.</strong> Use a senha temporária acima
                </div>
                <div class="step">
                  <strong>4.</strong> Crie uma nova senha quando solicitado
                </div>
              </div>
              
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" class="button">Acessar Sistema</a>
              
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Se você não solicitou este acesso, ignore este e-mail ou entre em contato conosco.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
      subject = 'AMESP - Bem-vindo ao sistema administrativo!'
    }

    // Configurar opções do e-mail
    const mailOptions = {
      from: `"${process.env.GMAIL_FROM_NAME}" <${process.env.GMAIL_FROM_EMAIL}>`,
      to: email,
      subject: subject,
      html: html
    }

    // Enviar e-mail
    const result = await transporter.sendMail(mailOptions)
    console.log('📧 E-mail enviado com sucesso:', result.messageId)

    return NextResponse.json({ 
      success: true, 
      message: 'E-mail enviado com sucesso',
      messageId: result.messageId
    })

  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao enviar e-mail' },
      { status: 500 }
    )
  }
}
