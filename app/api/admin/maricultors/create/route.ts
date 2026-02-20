import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email-sender'
import { phoneToMaricultorAuthEmail } from '@/lib/maricultor-auth-phone'

export async function POST(request: Request) {
  try {
    console.log('🔵 Iniciando cadastro de maricultor pelo admin...')
    
    const body = await request.json()
    console.log('📦 Body recebido:', body)
    
    const { full_name, email, cpf, phone, birth_date, cep, logradouro, cidade, estado, company, specialties } = body

    if (!full_name || !phone || !cpf) {
      console.log('❌ Validação falhou: campos obrigatórios faltando')
      return NextResponse.json(
        { error: 'Nome, telefone e CPF são obrigatórios' },
        { status: 400 }
      )
    }

    const authEmail = phoneToMaricultorAuthEmail(phone)
    if (!authEmail) {
      return NextResponse.json(
        { error: 'Telefone inválido. Informe com DDD (ex: 11 99999-9999).' },
        { status: 400 }
      )
    }

    // Validar CPF (11 dígitos)
    const cpfDigits = String(cpf).replace(/\D/g, '')
    console.log('🔢 CPF (dígitos):', cpfDigits)
    
    if (cpfDigits.length !== 11) {
      console.log('❌ CPF inválido:', cpfDigits.length, 'dígitos')
      return NextResponse.json(
        { error: 'CPF inválido' },
        { status: 400 }
      )
    }

    // Gerar senha: 6 primeiros dígitos do CPF
    const password = cpfDigits.substring(0, 6)
    console.log('🔐 Senha gerada:', password)

    // Criar cliente Supabase com Service Role Key (admin)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. Criar usuário no auth: login = telefone (formato 5511999999999@maricultor.amesp)
    console.log('👤 Criando usuário no auth.users (login por telefone):', authEmail)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
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
      console.error('❌ Erro ao criar usuário:', authError)
      const msg = (authError.message || '').toLowerCase()
      const isDuplicate = msg.includes('already been registered') || msg.includes('already exists') || msg.includes('duplicate')
      const status = isDuplicate ? 409 : 500
      const userMessage = isDuplicate
        ? 'Já existe um maricultor com este telefone. Use outro ou localize o cadastro existente.'
        : (authError.message || 'Erro ao criar usuário')
      return NextResponse.json(
        { error: userMessage },
        { status }
      )
    }

    const userId = authData.user.id
    console.log('✅ Usuário criado com ID:', userId)

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

    // 3. Criar perfil em maricultor_profiles
    console.log('📝 Criando perfil em maricultor_profiles...')
    console.log('📝 Dados do perfil:', {
      id: userId,
      full_name,
      cpf: cpfDigits,
      contact_phone: phone,
      logradouro,
      cidade,
      estado,
      cep,
      company,
      specialties,
      latitude,
      longitude
    })
    
    const clean = (v: unknown) => (v === '' || v === undefined ? null : v)
    const { error: profileError } = await supabase
      .from('maricultor_profiles')
      .insert({
        id: userId,
        full_name,
        cpf: cpfDigits,
        contact_phone: phone,
        birth_date: clean(birth_date) ?? null,
        logradouro: clean(logradouro) ?? null,
        cidade: clean(cidade) ?? null,
        estado: clean(estado) ?? null,
        cep: clean(cep) ?? null,
        company: clean(company) ?? null,
        specialties: clean(specialties) ?? null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        is_active: true
      })

    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError)
      await supabase.auth.admin.deleteUser(userId)
      const isDuplicateCpf =
        profileError.message?.includes('maricultor_profiles_cpf_unique') ||
        profileError.code === '23505'
      const status = isDuplicateCpf ? 409 : 500
      const message = isDuplicateCpf
        ? 'Já existe um maricultor cadastrado com este CPF. Use outro CPF ou localize o cadastro existente.'
        : (profileError.message || 'Erro ao criar perfil do maricultor')
      return NextResponse.json(
        { error: message },
        { status }
      )
    }
    
    console.log('✅ Perfil criado com sucesso!')

    // 4. Enviar email de boas-vindas só se tiver e-mail real (opcional; maricultores usam telefone para login)
    const realEmail = email && String(email).trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim()) ? String(email).trim() : null
    if (realEmail) {
      console.log('📧 Enviando email de boas-vindas para', realEmail)
      try {
        await sendEmail({
          to: realEmail,
          subject: 'Bem-vindo à AMESP - Credenciais de Acesso',
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
                  <h1 style="color: #0891b2; margin: 0 0 20px 0; font-size: 28px;">Bem-vindo à AMESP!</h1>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Olá <strong>${full_name}</strong>,</p>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Seu cadastro foi realizado. Use o <strong>telefone</strong> cadastrado e a senha abaixo para acessar:</p>
                  <div style="background: #f1f5f9; border-left: 4px solid #0891b2; padding: 20px; margin: 24px 0; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;"><strong>Telefone (login):</strong></p>
                    <p style="margin: 0 0 16px 0; color: #1e293b; font-size: 16px;">${phone}</p>
                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;"><strong>Senha:</strong></p>
                    <p style="margin: 0; color: #1e293b; font-size: 16px; font-family: monospace;">${password}</p>
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
        console.log('✅ Email enviado.')
      } catch (emailError) {
        console.error('⚠️ Erro ao enviar email (não crítico):', emailError)
      }
    } else {
      console.log('ℹ️ Sem e-mail real; credenciais: telefone + senha (6 primeiros do CPF).')
    }

    // 5. 🔔 Criar notificação (diretamente via Supabase)
    console.log('🔔 Criando notificação...')
    try {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          type: 'maricultor',
          title: `Novo maricultor cadastrado: ${full_name}`,
          message: `Cadastrado via admin • Telefone: ${phone} • Cidade: ${cidade || 'Não informada'}`,
          link: null,
          icon: 'UserPlus',
          priority: 'normal',
          metadata: {
            maricultor_id: userId,
            phone,
            city: cidade,
            company,
            created_by_admin: true
          }
        })

      if (notifError) {
        console.error('⚠️ Erro ao criar notificação:', notifError)
      } else {
        console.log('✅ Notificação criada com sucesso!')
      }
    } catch (notifError) {
      console.error('⚠️ Erro ao criar notificação (não crítico):', notifError)
    }

    console.log('🎉 Cadastro completo! Retornando sucesso...')
    return NextResponse.json({
      success: true,
      message: 'Maricultor cadastrado com sucesso',
      maricultor_id: userId
    })

  } catch (error: any) {
    console.error('❌ ERRO GERAL ao cadastrar maricultor:', error)
    const message = error?.message || (typeof error === 'string' ? error : 'Erro ao cadastrar maricultor')
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

