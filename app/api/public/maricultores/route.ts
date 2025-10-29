import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export async function GET() {
  try {
    // Tenta com client padrão; se RLS bloquear, cai para service role no backend
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('maricultor_profiles')
      .select('id, full_name, company, specialties, latitude, longitude, cidade, estado')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    let rows = data
    if (error || !rows) {
      // Fallback: usar Service Role no servidor para leitura pública (sem expor chave ao cliente)
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!url || !serviceKey) {
        return NextResponse.json({ error: error?.message || 'Configuração Supabase ausente' }, { status: 500 })
      }
      const admin = createAdminClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      const { data: adminData, error: adminErr } = await admin
        .from('maricultor_profiles')
        .select('id, full_name, company, specialties, latitude, longitude, cidade, estado')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
      if (adminErr) {
        return NextResponse.json({ error: adminErr.message }, { status: 500 })
      }
      rows = adminData || []
    }

    const features = (rows || []).map((m: any) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [Number(m.longitude), Number(m.latitude)] },
      properties: {
        id: m.id,
        name: m.full_name,
        company: m.company || null,
        specialties: m.specialties || [],
        cidade: m.cidade || null,
        estado: m.estado || null,
      },
    }))

    const geojson = { type: 'FeatureCollection', features }
    return NextResponse.json(geojson, { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro inesperado' }, { status: 500 })
  }
}


