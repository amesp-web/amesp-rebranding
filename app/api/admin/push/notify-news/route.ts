import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendPushToTopic } from "@/lib/push"

export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

    const { data: news, error } = await supabase.from("news").select("id, title, excerpt, published").eq("id", id).single()
    if (error || !news) return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    if (!news.published) return NextResponse.json({ success: true, skipped: "not published" })

    const body = (news.excerpt || "").slice(0, 70) + ((news.excerpt || "").length > 70 ? "…" : "")
    await sendPushToTopic("news", {
      title: "Nova notícia: " + news.title,
      body: body || "Confira no app.",
      url: "/news",
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[push] notify-news:", e)
    return NextResponse.json({ error: e.message || "Erro" }, { status: 500 })
  }
}
