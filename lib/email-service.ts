// lib/email-service.ts
export interface EmailTemplate {
  to: string
  subject: string
  html: string
}

export class EmailService {
  private static instance: EmailService

  private constructor() {
    // Não precisa mais do transporter aqui
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendWelcomeEmail(email: string, password: string, userName: string): Promise<boolean> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          userName
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('📧 E-mail enviado com sucesso:', result.messageId || 'simulado')
        return true
      } else {
        console.error('Erro ao enviar e-mail:', result.error)
        return false
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error)
      return false
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