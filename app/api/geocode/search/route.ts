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

    const params = new URLSearchParams({
      q: hint ? `${q} ${hint}` : q,
      format: 'json',
      addressdetails: '1',
      countrycodes: 'br',
      dedupe: '1',
      limit: '8',
      email: 'contato@amesp.org.br'
    })

    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        'User-Agent': 'AMESP-Rebranding/1.0 (contato@amesp.org.br)',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      },
      // Evita qualquer cache
      cache: 'no-store'
    })

    if (!res.ok) {
      return NextResponse.json({ results: [] }, { status: 200 })
    }
    const data = await res.json()
    return NextResponse.json({ results: Array.isArray(data) ? data : [] })
  } catch (err) {
    return NextResponse.json({ results: [] }, { status: 200 })
  }
}


