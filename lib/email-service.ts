// lib/email-service.ts
export interface EmailTemplate {
  to: string
  subject: string
  html: string
}

export class EmailService {
  private static instance: EmailService
  private apiKey: string

  private constructor() {
    this.apiKey = process.env.RESEND_API_KEY || ''
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendTemporaryPassword(email: string, password: string, userName: string): Promise<boolean> {
    const template = this.createTemporaryPasswordTemplate(email, password, userName)
    
    try {
      // Em desenvolvimento, apenas logamos
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 EMAIL SIMULADO:')
        console.log('Para:', email)
        console.log('Assunto:', template.subject)
        console.log('Senha temporária:', password)
        return true
      }

      // Em produção, usar Resend ou SendGrid
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      })

      return response.ok
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      return false
    }
  }

  private createTemporaryPasswordTemplate(email: string, password: string, userName: string): EmailTemplate {
    return {
      to: email,
      subject: 'AMESP - Sua senha temporária de acesso',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>AMESP - Acesso ao Sistema</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .password-box { background: #1e293b; color: #0ea5e9; padding: 20px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .button { background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🐟 AMESP</h1>
              <p>Associação dos Maricultores do Estado de São Paulo</p>
            </div>
            <div class="content">
              <h2>Olá, ${userName}!</h2>
              <p>Seu acesso ao sistema administrativo da AMESP foi criado com sucesso.</p>
              
              <div class="password-box">
                ${password}
              </div>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong> Esta é uma senha temporária. Você será obrigado a alterá-la no primeiro login por motivos de segurança.
              </div>
              
              <p>Para acessar o sistema:</p>
              <ol>
                <li>Vá para: <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login">${process.env.NEXT_PUBLIC_SITE_URL}/login</a></li>
                <li>Use seu e-mail: <strong>${email}</strong></li>
                <li>Use a senha temporária acima</li>
                <li>Crie uma nova senha quando solicitado</li>
              </ol>
              
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" class="button">Acessar Sistema</a>
              
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Se você não solicitou este acesso, ignore este e-mail ou entre em contato conosco.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  }

  async sendSMS(phone: string, code: string): Promise<boolean> {
    try {
      // Em desenvolvimento, apenas logamos
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 SMS SIMULADO:')
        console.log('Para:', phone)
        console.log('Código:', code)
        return true
      }

      // Em produção, usar Twilio ou similar
      const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone,
          From: process.env.TWILIO_PHONE_NUMBER || '',
          Body: `AMESP: Seu código de verificação é ${code}. Válido por 5 minutos.`
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Erro ao enviar SMS:', error)
      return false
    }
  }
}
