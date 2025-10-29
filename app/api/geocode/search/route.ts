// app/api/geocode/search/route.ts
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const hint = searchParams.get('hint') || ''
    if (!q || q.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    const commonHeaders = {
      'User-Agent': 'AMESP-Rebranding/1.0 (contato@amesp.org.br)',
      'Accept-Language': 'pt-BR,pt;q=0.9'
    } as const

    // 1) Texto livre com hint
    const paramsFree = new URLSearchParams({
      q: hint ? `${q} ${hint}` : q,
      format: 'json', addressdetails: '1', countrycodes: 'br', dedupe: '1', limit: '8', email: 'contato@amesp.org.br'
    })
    const resFree = await fetch(`https://nominatim.openstreetmap.org/search?${paramsFree.toString()}`, { headers: commonHeaders, cache: 'no-store' })
    let results: any[] = []
    if (resFree.ok) {
      const data = await resFree.json()
      if (Array.isArray(data)) results = data
    }

    // 2) Se vazio, tenta consulta estruturada por rua/cidade/estado (quando houver hint)
    if (results.length === 0) {
      const [cityHint = '', stateHint = ''] = hint.split(/[,\s]+/).filter(Boolean)
      const paramsStruct = new URLSearchParams({
        street: q,
        city: cityHint,
        state: stateHint,
        country: 'BR',
        format: 'json', addressdetails: '1', dedupe: '1', limit: '8', email: 'contato@amesp.org.br'
      })
      const resStruct = await fetch(`https://nominatim.openstreetmap.org/search?${paramsStruct.toString()}`, { headers: commonHeaders, cache: 'no-store' })
      if (resStruct.ok) {
        const data = await resStruct.json()
        if (Array.isArray(data)) results = data
      }
    }

    // 3) Se ainda vazio, tenta limitar por "litoral norte de SP" (viewbox + bounded)
    if (results.length === 0) {
      // Aproximação: bbox da região Ubatuba/Caraguatatuba/Ilhabela/São Sebastião
      // viewbox: lon_min,lat_min,lon_max,lat_max
      const bbox = {
        lonMin: '-46.9', latMin: '-24.2', lonMax: '-44.0', latMax: '-22.5'
      }
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

    return NextResponse.json({ results })
  } catch (err) {
    return NextResponse.json({ results: [] }, { status: 200 })
  }
}


