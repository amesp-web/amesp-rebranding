import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Proxy da logo do maricultor: busca no Supabase Storage (público) e devolve a imagem.
 * Uso: GET /api/public/maricultor-logo?path=UUID/logo.png
 * Assim o navegador pede a imagem ao mesmo domínio e evita CORS/bloqueio de img externa.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    if (!path || path.includes('..')) {
      return new NextResponse('path inválido', { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      return new NextResponse('Configuração ausente', { status: 500 })
    }

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/maricultor_logos/${path}`
    const res = await fetch(imageUrl, { cache: 'no-store' })
    if (!res.ok) {
      return new NextResponse('Logo não encontrada', { status: res.status })
    }

    const contentType = res.headers.get('content-type') || 'image/png'
    const body = await res.arrayBuffer()
    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (e) {
    console.error('Erro ao buscar logo:', e)
    return new NextResponse('Erro ao buscar logo', { status: 500 })
  }
}
