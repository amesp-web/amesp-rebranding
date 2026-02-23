import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

/**
 * GET /api/maricultor/mensalidades
 * Retorna o status de mensalidades do maricultor logado no ano atual (meses 1 até o mês atual).
 * Só o próprio maricultor pode chamar.
 */
export async function GET() {
  try {
    const supabaseServer = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const maricultorId = user.id
    const now = new Date()
    const year = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    const supabase = getSupabaseAdmin()

    const { data: profile, error: profileError } = await supabase
      .from("maricultor_profiles")
      .select("id, fee_exempt")
      .eq("id", maricultorId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 })
    }

    if (profile.fee_exempt) {
      return NextResponse.json({
        year,
        currentMonth,
        fee_exempt: true,
        em_dia: true,
        paid_months: [],
        pending_months: [],
        message: "Você é isento de mensalidade.",
      })
    }

    const { data: payments, error: paymentsError } = await supabase
      .from("maricultor_monthly_payments")
      .select("month")
      .eq("maricultor_id", maricultorId)
      .eq("year", year)

    if (paymentsError) {
      console.error(paymentsError)
      return NextResponse.json({ error: "Erro ao consultar pagamentos" }, { status: 500 })
    }

    const paidMonths = new Set((payments || []).map((p) => p.month))
    const monthsUntilNow = Array.from({ length: currentMonth }, (_, i) => i + 1)
    const pendingMonths = monthsUntilNow.filter((m) => !paidMonths.has(m))
    const em_dia = pendingMonths.length === 0

    return NextResponse.json({
      year,
      currentMonth,
      fee_exempt: false,
      em_dia,
      paid_months: monthsUntilNow.filter((m) => paidMonths.has(m)),
      pending_months: pendingMonths,
      month_names: MONTH_NAMES,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
