import { NextResponse } from "next/server"
import { sendPushToTopic } from "@/lib/push"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const MONTH_NAMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

/**
 * GET /api/cron/mensalidade-notifications
 *
 * Chamado pelo Vercel Cron uma vez por dia. Envia:
 * - Dia 1 do mês: notificação de que a mensalidade já está disponível para pagamento.
 * - Últimos 3 dias do mês: lembrete para quem ainda não pagou que a mensalidade vence em breve.
 *
 * Protegido por CRON_SECRET (header Authorization: Bearer <CRON_SECRET>).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const secret = process.env.CRON_SECRET
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const day = now.getDate()
  const month = now.getMonth()
  const monthName = MONTH_NAMES[month]
  const year = now.getFullYear()

  // Últimos 3 dias do mês: 29, 30, 31 (ou 28/29 para fevereiro)
  const lastDay = new Date(year, month + 1, 0).getDate()
  const lastThreeDays = [lastDay - 2, lastDay - 1, lastDay].filter((d) => d >= 1)
  const isLastThreeDays = lastThreeDays.includes(day)
  const isFirstDay = day === 1

  try {
    if (isFirstDay) {
      await sendPushToTopic("payments", {
        title: "Mensalidade disponível",
        body: "Sua parceria é muito importante para a AMESP. Se desejar contribuir este mês, entre em contato conosco.",
        url: "/maricultor/dashboard",
      })
      return NextResponse.json({
        sent: true,
        type: "disponivel",
        message: "Notificação de mensalidade disponível enviada.",
      })
    }

    if (isLastThreeDays) {
      await sendPushToTopic("payments", {
        title: "Mensalidade",
        body: "Que tal apoiar a AMESP este mês? Sua contribuição faz a diferença.",
        url: "/maricultor/dashboard",
      })
      return NextResponse.json({
        sent: true,
        type: "lembrete_vencimento",
        message: "Lembrete de vencimento enviado.",
      })
    }

    return NextResponse.json({
      sent: false,
      reason: "Hoje não é dia 1 nem um dos últimos 3 dias do mês.",
      day,
      lastThreeDays,
    })
  } catch (e: any) {
    console.error("[cron] mensalidade-notifications:", e)
    return NextResponse.json(
      { error: e?.message || "Erro ao enviar notificações" },
      { status: 500 }
    )
  }
}
