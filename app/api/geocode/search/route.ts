// app/api/geocode/search/route.ts
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const city = (searchParams.get('city') || '').trim()
    const state = (searchParams.get('state') || '').trim()
    if (!q || q.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    const commonHeaders = {
      'User-Agent': 'AMESP-Rebranding/1.0 (contato@amesp.org.br)',
      'Accept-Language': 'pt-BR,pt;q=0.9'
    } as const

    let results: any[] = []

    // 1) Consulta estruturada (prioritária): rua + cidade + UF
    if (city && state) {
      const paramsStruct = new URLSearchParams({
        street: q,
        city,
        state,
        country: 'BR',
        format: 'json', addressdetails: '1', dedupe: '1', limit: '8', email: 'contato@amesp.org.br'
      })
      const resStruct = await fetch(`https://nominatim.openstreetmap.org/search?${paramsStruct.toString()}`, { headers: commonHeaders, cache: 'no-store' })
      if (resStruct.ok) {
        const data = await resStruct.json()
        if (Array.isArray(data)) results = data
      }
    }

    // 2) Se vazio, busca livre com city/UF anexados
    if (results.length === 0) {
      const paramsFree = new URLSearchParams({
        q: `${q} ${city || ''} ${state || ''}`.trim(),
        format: 'json', addressdetails: '1', countrycodes: 'br', dedupe: '1', limit: '8', email: 'contato@amesp.org.br'
      })
      const resFree = await fetch(`https://nominatim.openstreetmap.org/search?${paramsFree.toString()}`, { headers: commonHeaders, cache: 'no-store' })
      if (resFree.ok) {
        const data = await resFree.json()
        if (Array.isArray(data)) results = data
      }
    }

    // 3) Se ainda vazio, tenta limitar por litoral norte SP (viewbox + bounded)
    if (results.length === 0) {
      const bbox = { lonMin: '-46.9', latMin: '-24.2', lonMax: '-44.0', latMax: '-22.5' }
      const paramsBbox = new URLSearchParams({
        q,
        format: 'json', addressdetails: '1', countrycodes: 'br', dedupe: '1', limit: '8', bounded: '1',
        viewbox: `${bbox.lonMin},${bbox.latMin},${bbox.lonMax},${bbox.latMax}`,
        email: 'contato@amesp.org.br'
      })
      const resBbox = await fetch(`https://nominatim.openstreetmap.org/search?${paramsBbox.toString()}`, { headers: commonHeaders, cache: 'no-store' })
      if (resBbox.ok) {
        const data = await resBbox.json()
        if (Array.isArray(data)) results = data
      }
    }

    // 4) Fallback final: Photon (fuzzy)
    if (results.length === 0) {
      const photon = `https://photon.komoot.io/api/?q=${encodeURIComponent(`${q} ${city || ''} ${state || ''}`.trim())}&lang=pt&limit=8&osm_tag=highway`
      const r = await fetch(photon, { cache: 'no-store', headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } })
      if (r.ok) {
        const data = await r.json()
        if (data && Array.isArray(data.features)) {
          results = data.features.map((f: any) => {
            const p = f.properties || {}
            const addr: any = {
              road: p.street || p.name,
              house_number: p.housenumber,
              city: p.city || p.town || p.village,
              state: p.state
            }
            return {
              lat: f.geometry?.coordinates?.[1],
              lon: f.geometry?.coordinates?.[0],
              display_name: `${addr.road || ''} ${addr.house_number || ''}`.trim(),
              address: addr
            }
          })
        }
      }
    }

    return NextResponse.json({ results })
  } catch (err) {
    return NextResponse.json({ results: [] }, { status: 200 })
  }
}


