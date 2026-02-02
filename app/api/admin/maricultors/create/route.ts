import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email-sender'

export async function POST(request: Request) {
  try {
    console.log('🔵 Iniciando cadastro de maricultor pelo admin...')
    
    const body = await request.json()
    console.log('📦 Body recebido:', body)
    
    const { full_name, email, cpf, phone, birth_date, cep, logradouro, cidade, estado, company, specialties } = body

    // Validações
    if (!full_name || !email || !cpf) {
      console.log('❌ Validação falhou: campos obrigatórios faltando')
      return NextResponse.json(
        { error: 'Nome, email e CPF são obrigatórios' },
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

    // 1. Criar usuário no auth.users
    console.log('👤 Criando usuário no auth.users:', email)
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
      console.error('❌ Erro ao criar usuário:', authError)
      const msg = (authError.message || '').toLowerCase()
      const isDuplicateEmail = msg.includes('already been registered') || msg.includes('already exists') || msg.includes('duplicate')
      const status = isDuplicateEmail ? 409 : 500
      const userMessage = isDuplicateEmail
        ? 'Já existe um maricultor cadastrado com este e-mail. Use outro e-mail ou localize o cadastro existente.'
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
    
    const { error: profileError } = await supabase
      .from('maricultor_profiles')
      .insert({
        id: userId,
        full_name,
        cpf: cpfDigits,
        contact_phone: phone,
        birth_date: birth_date || null,
        logradouro,
        cidade,
        estado,
        cep,
        company,
        specialties,
        latitude,
        longitude,
        is_active: true
      })

    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError)
      console.error('❌ Detalhes do erro:', JSON.stringify(profileError, null, 2))
      
      // Rollback: deletar usuário criado
      console.log('🔄 Fazendo rollback: deletando usuário', userId)
      await supabase.auth.admin.deleteUser(userId)
      
      return NextResponse.json(
        { error: 'Erro ao criar perfil do maricultor' },
        { status: 500 }
      )
    }
    
    console.log('✅ Perfil criado com sucesso!')

    // 4. Enviar email de boas-vindas com as credenciais
    console.log('📧 Enviando email de boas-vindas...')
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
      console.log('✅ Email enviado com sucesso!')
    } catch (emailError) {
      console.error('⚠️ Erro ao enviar email (não crítico):', emailError)
    }

    // 5. 🔔 Criar notificação (diretamente via Supabase)
    console.log('🔔 Criando notificação...')
    try {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
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
    console.error('❌ Stack trace:', error.stack)
    console.error('❌ Detalhes completos:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: error.message || 'Erro ao cadastrar maricultor' },
      { status: 500 }
    )
  }
}

