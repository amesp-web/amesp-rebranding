// app/api/maricultor/register/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      id, // auth.users id do maricultor
      full_name,
      phone,
      logradouro,
      cidade,
      estado,
      cep,
      company,
      specialties,
      latitude,
      longitude,
    } = body || {}

    if (!id || !full_name) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes (id, full_name)' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      console.error('❌ Variáveis de ambiente ausentes: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json({ error: 'Configuração do servidor ausente (SUPABASE envs)' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // Se não recebemos latitude/longitude, geocodificamos no servidor
    let lat = latitude ?? null
    let lon = longitude ?? null
    
    console.log('🗺️ Geocodificação - Estado inicial:', { lat, lon, logradouro, cidade, estado, cep })
    
    if ((lat == null || lon == null) && (logradouro || cidade || estado || cep)) {
      try {
        const apiKey = process.env.GEOAPIFY_API_KEY || process.env.NEXT_PUBLIC_GEOAPIFY_KEY
        console.log('🔑 API Key presente:', !!apiKey)
        
        if (!apiKey) {
          console.error('❌ GEOAPIFY_API_KEY não configurada! Geocodificação impossível.')
        } else {
          const parts = [logradouro, cidade, estado, 'Brasil']
          const text = parts.filter(Boolean).join(', ')
          const cleanCep = cep ? String(cep).replace(/\D/g, '') : ''
          const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text)}&limit=1&lang=pt&filter=countrycode:br${cleanCep ? `&postcode=${cleanCep}` : ''}&apiKey=${apiKey}`
          
          console.log('🌐 URL Geoapify:', url.replace(apiKey, 'API_KEY_HIDDEN'))
          
          const res = await fetch(url, { cache: 'no-store' })
          const data = await res.json()
          
          console.log('📍 Resposta Geoapify:', JSON.stringify(data, null, 2))
          
          const p = data?.features?.[0]?.properties
          lat = p?.lat ?? data?.features?.[0]?.geometry?.coordinates?.[1] ?? null
          lon = p?.lon ?? data?.features?.[0]?.geometry?.coordinates?.[0] ?? null
          
          console.log('✅ Coordenadas extraídas:', { lat, lon })
          
          if (!lat || !lon) {
            console.warn('⚠️ Geocodificação retornou resultado vazio ou sem coordenadas')
          }
        }
      } catch (geoErr) {
        console.error('❌ Falha ao geocodificar no servidor:', geoErr)
      }
    }
    
    console.log('📍 Coordenadas finais para salvar:', { latitude: lat, longitude: lon })

    // Monta payload inicial
    // Conjunto de colunas esperadas — evita enviar chaves supérfluas
    const allowedKeys = new Set([
      'id', 'full_name', 'contact_phone', 'logradouro', 'cidade', 'estado', 'cep',
      'company', 'specialties', 'latitude', 'longitude', 'updated_at', 'created_at', 'is_active'
    ])
    const cleanCep = cep ? String(cep).replace(/\D/g, '') : null
    
    const basePayload: Record<string, any> = {
      id,
      full_name,
      contact_phone: phone,
      logradouro,
      cidade,
      estado,
      cep: cleanCep,
      company,
      specialties,
      latitude: lat,
      longitude: lon,
      updated_at: new Date().toISOString(),
    }
    let payload: Record<string, any> = {}
    for (const [k, v] of Object.entries(basePayload)) {
      if (v !== undefined && allowedKeys.has(k)) payload[k] = v
    }

    // Tenta upsert removendo colunas desconhecidas se necessário
    const maxAttempts = 6
    let lastError: any = null
    for (let i = 0; i < maxAttempts; i++) {
      const { error: upsertError } = await supabase
        .from('maricultor_profiles')
        .upsert(payload, { onConflict: 'id' })

      if (!upsertError) { lastError = null; break }
      lastError = upsertError
      const msg: string = String(upsertError.message || '')
      const match = msg.match(/Could not find the '([^']+)' column/)
      if (match && match[1] && payload.hasOwnProperty(match[1])) {
        const missing = match[1]
        console.warn(`⚠️ Removendo coluna ausente em maricultor_profiles: ${missing}`)
        delete payload[missing]
        continue
      }
      // Se o erro for de outro tipo, para
      break
    }

    if (lastError) {
      console.error('❌ Erro ao inserir maricultor_profiles (final):', lastError)
      return NextResponse.json({ error: lastError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('❌ Erro inesperado em /api/maricultor/register:', err)
    return NextResponse.json({ error: err?.message || 'Erro inesperado' }, { status: 500 })
  }
}


