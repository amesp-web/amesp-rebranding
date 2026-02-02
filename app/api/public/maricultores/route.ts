import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Usar sempre Service Role para garantir logo_path e demais campos (evita RLS/anon)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Configuração Supabase ausente' }, { status: 500 })
    }
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data: rawRows, error } = await supabase
      .from('maricultor_profiles')
      .select('id, full_name, company, specialties, latitude, longitude, cidade, estado, logo_path, contact_phone, show_on_map')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Excluir maricultores marcados como "oculto no mapa" (show_on_map === false)
    const rows = (rawRows || []).filter((m: any) => m.show_on_map !== false)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    // Normaliza logo_path: remove vírgulas/espacos; se for só UUID, assume "uuid/logo.png"
    const toLogoUrl = (logoPath: string | null | undefined): string | null => {
      if (!logoPath || !supabaseUrl) return null
      const clean = String(logoPath).trim().replace(/,+$/, '')
      if (!clean) return null
      const path = clean.includes('/') ? clean : `${clean}/logo.png`
      return `${supabaseUrl}/storage/v1/object/public/maricultor_logos/${path}`
    }
    const features = rows.map((m: any) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [Number(m.longitude), Number(m.latitude)] },
      properties: {
        id: m.id,
        name: m.full_name,
        company: m.company || null,
        specialties: m.specialties || [],
        cidade: m.cidade || null,
        estado: m.estado || null,
        logo_url: toLogoUrl(m.logo_path),
        contact_phone: m.contact_phone || null,
      },
    }))

    const geojson = { type: 'FeatureCollection', features }
    return NextResponse.json(geojson, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro inesperado' }, { status: 500 })
  }
}


