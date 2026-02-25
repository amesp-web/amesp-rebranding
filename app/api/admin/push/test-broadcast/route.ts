import { NextResponse } from "next/server"
import { sendPushToTopic } from "@/lib/push"

export async function POST() {
  try {
    await Promise.all([
      sendPushToTopic("news", {
        title: "AMESP - teste de notícias",
        body: "Se você recebeu esta notificação, o PWA está configurado para notícias.",
        url: "/news",
      }),
      sendPushToTopic("events", {
        title: "AMESP - teste de eventos",
        body: "Se você recebeu esta notificação, o PWA está configurado para eventos.",
        url: "/#eventos",
      }),
      sendPushToTopic("payments", {
        title: "AMESP - teste de mensalidade",
        body: "Se você recebeu esta notificação, o PWA está configurado para lembretes de mensalidade.",
        url: "/maricultor/dashboard",
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[push] test-broadcast error:", e)
    return NextResponse.json({ error: "Erro ao enviar teste" }, { status: 500 })
  }
}

