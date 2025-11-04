// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email-sender'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, company, subject, message, newsletter } = await request.json()

    // Validações
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Email de destino (quem recebe as mensagens)
    const recipientEmail = process.env.CONTACT_EMAIL_RECIPIENT || 'comunicacao.amesp@gmail.com'

    // Template do email
    const emailTemplate = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nova Mensagem de Contato - AMESP</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
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
                      Nova Mensagem de Contato
                    </h1>
                  </td>
                </tr>

                <!-- Conteúdo -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Uma nova mensagem foi enviada através do formulário de contato do site:
                    </p>

                    <!-- Informações do Remetente -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Dados do Contato
                          </p>
                          
                          <p style="margin: 0 0 8px 0; color: #334155; font-size: 14px;">
                            <strong style="color: #0ea5e9;">👤 Nome:</strong> ${name}
                          </p>
                          
                          <p style="margin: 0 0 8px 0; color: #334155; font-size: 14px;">
                            <strong style="color: #0ea5e9;">✉️ Email:</strong> 
                            <a href="mailto:${email}" style="color: #0ea5e9; text-decoration: none;">${email}</a>
                          </p>
                          
                          ${phone ? `
                          <p style="margin: 0 0 8px 0; color: #334155; font-size: 14px;">
                            <strong style="color: #0ea5e9;">📞 Telefone:</strong> ${phone}
                          </p>
                          ` : ''}
                          
                          ${company ? `
                          <p style="margin: 0 0 8px 0; color: #334155; font-size: 14px;">
                            <strong style="color: #0ea5e9;">🏢 Empresa:</strong> ${company}
                          </p>
                          ` : ''}
                          
                          <p style="margin: 0; color: #334155; font-size: 14px;">
                            <strong style="color: #0ea5e9;">📋 Assunto:</strong> ${subject}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Mensagem -->
                    <div style="background-color: #ffffff; border-left: 4px solid #0ea5e9; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                      <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Mensagem
                      </p>
                      <p style="color: #334155; font-size: 15px; line-height: 1.8; margin: 0; white-space: pre-wrap;">
                        ${message}
                      </p>
                    </div>

                    ${newsletter ? `
                    <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
                      <p style="margin: 0; color: #1e40af; font-size: 13px;">
                        ℹ️ Este contato deseja <strong>receber newsletters</strong> sobre maricultura
                      </p>
                    </div>
                    ` : ''}

                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />

                    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                      Mensagem recebida em: <strong>${new Date().toLocaleString('pt-BR')}</strong><br>
                      Para responder, clique em "Responder" que o email será enviado automaticamente para: <strong>${email}</strong>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                      Este email foi gerado automaticamente pelo formulário de contato do site AMESP.
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

    // Enviar email
    const emailResult = await sendEmail({
      to: recipientEmail,
      subject: `Nova Mensagem de Contato - ${subject}`,
      html: emailTemplate,
      replyTo: email // Importante! Para poder responder direto ao cliente
    })

    if (!emailResult.success) {
      console.error('❌ Erro ao enviar email de contato:', emailResult.error)
      return NextResponse.json(
        { success: false, error: 'Erro ao enviar mensagem' },
        { status: 500 }
      )
    }

    console.log('✅ Email de contato enviado para:', recipientEmail, '| De:', email)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Mensagem enviada com sucesso!' 
    })

  } catch (error) {
    console.error('Erro ao processar formulário de contato:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

