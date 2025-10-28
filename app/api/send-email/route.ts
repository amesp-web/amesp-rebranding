// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email, password, userName } = await request.json()

    // Verificar se as configurações do Gmail estão disponíveis
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      console.log('📧 EMAIL SIMULADO (Gmail não configurado):')
      console.log('Para:', email)
      console.log('Senha temporária:', password)
      return NextResponse.json({ success: true, message: 'E-mail simulado enviado' })
    }

    // Configurar transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    })

    // Template do e-mail
    const html = `
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
            <h1>🐟 AMESP</h1>
            <p>Associação dos Maricultores do Estado de São Paulo</p>
          </div>
          <div class="content">
            <h2>Bem-vindo, ${userName}!</h2>
            <p>Seu acesso ao sistema administrativo da AMESP foi criado com sucesso. Estamos felizes em tê-lo conosco!</p>
            
            <div class="password-box">
              ${password}
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

    // Configurar opções do e-mail
    const mailOptions = {
      from: `"${process.env.GMAIL_FROM_NAME}" <${process.env.GMAIL_FROM_EMAIL}>`,
      to: email,
      subject: 'AMESP - Bem-vindo ao sistema administrativo!',
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
