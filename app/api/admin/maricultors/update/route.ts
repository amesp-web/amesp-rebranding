import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email-sender'
import { phoneToMaricultorAuthEmail, isMaricultorAuthEmail } from '@/lib/maricultor-auth-phone'

export async function PUT(request: Request) {
  try {
    console.log('🔵 Iniciando atualização de maricultor...')
    
    const body = await request.json()
    console.log('📦 Body recebido:', body)
    
    const { id, full_name, cpf, contact_phone, birth_date, cep, logradouro, cidade, estado, company, specialties, email: emailParaEnvio, send_credentials_email } = body

    if (!id || !full_name) {
      console.log('❌ Validação falhou: ID ou nome faltando')
      return NextResponse.json(
        { error: 'ID e nome são obrigatórios' },
        { status: 400 }
      )
    }

    const cpfDigits = cpf ? String(cpf).replace(/\D/g, '') : null
    console.log('🔢 CPF (dígitos):', cpfDigits)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const passwordForCredentials = cpfDigits && cpfDigits.length === 11 ? cpfDigits.substring(0, 6) : null
    const authEmailFromPhone = contact_phone ? phoneToMaricultorAuthEmail(contact_phone) : null
    const shouldUpdateAuthEmail = !!authEmailFromPhone
    const shouldUpdatePassword = send_credentials_email && passwordForCredentials
    const authUpdatePayload: { user_metadata: Record<string, unknown>; email?: string; password?: string } = {
      user_metadata: {
        name: full_name,
        phone: contact_phone,
        company,
        specialties,
        user_type: "maricultor",
        cpf: cpfDigits
      }
    }
    if (shouldUpdateAuthEmail) authUpdatePayload.email = authEmailFromPhone
    if (shouldUpdatePassword) authUpdatePayload.password = passwordForCredentials

    console.log('👤 Atualizando auth.users...', shouldUpdateAuthEmail ? '(login = telefone)' : '', shouldUpdatePassword ? '(senha)' : '')
    const { error: authError } = await supabase.auth.admin.updateUserById(id, authUpdatePayload)

    if (authError) {
      console.error('❌ Erro ao atualizar auth.users:', authError)
      return NextResponse.json(
        { error: authError.message || 'Erro ao atualizar usuário' },
        { status: 500 }
      )
    }
    console.log('✅ auth.users atualizado com sucesso!')

    let emailToSendCredentials: string | null = null
    if (send_credentials_email && passwordForCredentials) {
      const realEmail = emailParaEnvio && String(emailParaEnvio).trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(emailParaEnvio).trim()) ? String(emailParaEnvio).trim() : null
      if (realEmail && !isMaricultorAuthEmail(realEmail)) emailToSendCredentials = realEmail
    }

    // 2. Geocodificar endereço (buscar latitude e longitude)
    let latitude: number | null = null
    let longitude: number | null = null
    
    if (logradouro || cidade || estado || cep) {
      try {
        const apiKey = process.env.GEOAPIFY_API_KEY || process.env.NEXT_PUBLIC_GEOAPIFY_KEY
        console.log('🗺️ Iniciando geocodificação...', { apiKey: !!apiKey })
        
        if (apiKey) {
          const parts = [logradouro, cidade, estado, 'Brasil']
          const text = parts.filter(Boolean).join(', ')
          const cleanCep = cep ? String(cep).replace(/\D/g, '') : ''
          const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text)}&limit=1&lang=pt&filter=countrycode:br${cleanCep ? `&postcode=${cleanCep}` : ''}&apiKey=${apiKey}`
          
          console.log('🌐 Buscando coordenadas via Geoapify...')
          
          const res = await fetch(url, { cache: 'no-store' })
          const data = await res.json()
          
          const p = data?.features?.[0]?.properties
          latitude = p?.lat ?? data?.features?.[0]?.geometry?.coordinates?.[1] ?? null
          longitude = p?.lon ?? data?.features?.[0]?.geometry?.coordinates?.[0] ?? null
          
          console.log('📍 Coordenadas obtidas:', { latitude, longitude })
        } else {
          console.warn('⚠️ GEOAPIFY_API_KEY não configurada, geocodificação ignorada')
        }
      } catch (geoErr) {
        console.error('❌ Erro ao geocodificar (não crítico):', geoErr)
      }
    }

    // 3. Atualizar perfil em maricultor_profiles
    console.log('📝 Atualizando perfil em maricultor_profiles...')
    
    const updateData: any = {
      full_name,
      contact_phone,
      logradouro, // Já vem concatenado com o número (ex: "Rua ABC, 123")
      cidade,
      estado,
      cep: cep ? cep.replace(/\D/g, '') : null,
      company,
      specialties,
      updated_at: new Date().toISOString()
    }

    // Adicionar CPF se fornecido
    if (cpfDigits) {
      updateData.cpf = cpfDigits
    }

    // Data de nascimento (YYYY-MM-DD ou null)
    if (birth_date !== undefined) {
      updateData.birth_date = birth_date || null
    }

    // Adicionar coordenadas se obtidas
    if (latitude !== null) updateData.latitude = latitude
    if (longitude !== null) updateData.longitude = longitude

    console.log('📝 Dados para atualizar:', updateData)
    
    const { error: profileError } = await supabase
      .from('maricultor_profiles')
      .update(updateData)
      .eq('id', id)

    if (profileError) {
      console.error('❌ Erro ao atualizar perfil:', profileError)
      console.error('❌ Detalhes do erro:', JSON.stringify(profileError, null, 2))
      
      return NextResponse.json(
        { error: 'Erro ao atualizar perfil do maricultor' },
        { status: 500 }
      )
    }
    
    console.log('✅ Perfil atualizado com sucesso!')

    // 4. Enviar credenciais por e-mail só se tiver e-mail real (opcional; login do maricultor é por telefone)
    if (send_credentials_email && emailToSendCredentials && passwordForCredentials) {
      console.log('📧 Enviando credenciais para', emailToSendCredentials)
      try {
        await sendEmail({
          to: emailToSendCredentials,
          subject: 'AMESP - Credenciais de acesso',
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
                  <h1 style="color: #0891b2; margin: 0 0 20px 0; font-size: 28px;">Credenciais de Acesso - AMESP</h1>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Olá <strong>${full_name}</strong>,</p>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Seu cadastro foi atualizado. Use o <strong>telefone</strong> cadastrado e a senha abaixo para acessar:</p>
                  <div style="background: #f1f5f9; border-left: 4px solid #0891b2; padding: 20px; margin: 24px 0; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;"><strong>Telefone (login):</strong></p>
                    <p style="margin: 0 0 16px 0; color: #1e293b; font-size: 16px;">${contact_phone || '—'}</p>
                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;"><strong>Senha:</strong></p>
                    <p style="margin: 0; color: #1e293b; font-size: 16px; font-family: monospace;">${passwordForCredentials}</p>
                  </div>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://amesp-rebranding.vercel.app'}/login" style="display: inline-block; background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600;">Acessar Plataforma</a>
                  </div>
                  <p style="color: #94a3b8; font-size: 14px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">Atenciosamente,<br><strong>Equipe AMESP</strong></p>
                </div>
              </div>
            </body>
            </html>
          `
        })
        console.log('✅ E-mail de credenciais enviado.')
      } catch (emailErr) {
        console.error('⚠️ Erro ao enviar e-mail (não crítico):', emailErr)
      }
    }

    console.log('🎉 Atualização completa! Retornando sucesso...')
    return NextResponse.json({
      success: true,
      message: 'Maricultor atualizado com sucesso'
    })

  } catch (error: any) {
    console.error('❌ ERRO GERAL ao atualizar maricultor:', error)
    console.error('❌ Stack trace:', error.stack)
    console.error('❌ Detalhes completos:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar maricultor' },
      { status: 500 }
    )
  }
}

