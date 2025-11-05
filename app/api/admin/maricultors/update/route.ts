import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(request: Request) {
  try {
    console.log('🔵 Iniciando atualização de maricultor...')
    
    const body = await request.json()
    console.log('📦 Body recebido:', body)
    
    const { id, full_name, cpf, contact_phone, cep, logradouro, cidade, estado, company, specialties } = body

    // Validações
    if (!id || !full_name) {
      console.log('❌ Validação falhou: ID ou nome faltando')
      return NextResponse.json(
        { error: 'ID e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Limpar CPF (remover formatação)
    const cpfDigits = cpf ? String(cpf).replace(/\D/g, '') : null
    console.log('🔢 CPF (dígitos):', cpfDigits)

    // Criar cliente Supabase com Service Role Key (admin)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    console.log('🔧 Criando cliente Supabase com Service Role...')
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. Atualizar user_metadata em auth.users
    console.log('👤 Atualizando user_metadata em auth.users...')
    const { error: authError } = await supabase.auth.admin.updateUserById(
      id,
      {
        user_metadata: {
          name: full_name,
          phone: contact_phone,
          company,
          specialties,
          user_type: "maricultor",
          cpf: cpfDigits
        }
      }
    )

    if (authError) {
      console.error('❌ Erro ao atualizar auth.users:', authError)
      return NextResponse.json(
        { error: authError.message || 'Erro ao atualizar usuário' },
        { status: 500 }
      )
    }
    console.log('✅ auth.users atualizado com sucesso!')

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

