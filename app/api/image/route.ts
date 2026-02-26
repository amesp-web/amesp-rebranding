import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

/** GET /api/image?url=...&w=900&q=75 — redimensiona imagens do Supabase para o modal carregar mais rápido */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawUrl = searchParams.get("url")
  const width = Math.min(Number(searchParams.get("w")) || 900, 1600)
  const quality = Math.min(Math.max(Number(searchParams.get("q")) || 75, 20), 100)

  if (!rawUrl || !SUPABASE_URL) {
    return NextResponse.json({ error: "Missing url or config" }, { status: 400 })
  }

  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 })
  }

  if (!rawUrl.startsWith(SUPABASE_URL)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 })
  }

  try {
    const res = await fetch(url.toString(), { cache: "force-cache" })
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: 502 })
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    const out = await sharp(buffer)
      .resize(width, undefined, { withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer()

    return new NextResponse(out, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (e) {
    console.error("[api/image]", e)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}
