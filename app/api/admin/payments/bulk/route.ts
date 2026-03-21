import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const PAYMENT_METHODS = ["dinheiro", "pix", "peixe", "materiais", "outros", "isento"] as const
const MIN_YEAR = 2000
const MAX_YEAR = 2100
const MONTHLY_FEE = 10
const MAX_ALLOCATIONS = 240

type ExistingPayment = {
  id: string
  year: number
  month: number
  amount: number | null
  payment_method: string | null
}

async function ensureAdmin() {
  const supabaseServer = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabaseServer.auth.getUser()
  if (authError || !user) return { error: "Não autenticado", status: 401 as const }

  const { data: adminProfile } = await supabaseServer
    .from("admin_profiles")
    .select("id, is_active")
    .eq("id", user.id)
    .single()

  if (!adminProfile?.is_active) return { error: "Acesso negado", status: 403 as const }
  return { ok: true as const, userId: user.id }
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function parsePeriod(yyyymm: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(yyyymm || "")
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  if (year < MIN_YEAR || year > MAX_YEAR || month < 1 || month > 12) return null
  return { year, month }
}

function monthKey(year: number, month: number) {
  return year * 12 + (month - 1)
}

function fromMonthKey(key: number) {
  const year = Math.floor(key / 12)
  const month = (key % 12) + 1
  return { year, month }
}

function formatCompetence(year: number, month: number) {
  return `${String(month).padStart(2, "0")}/${year}`
}

export async function POST(request: NextRequest) {
  try {
    const auth = await ensureAdmin()
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const {
      maricultor_id,
      amount_total,
      start_period,
      end_period,
      payment_method,
      paid_at,
      notes,
      overflow_strategy,
    } = body ?? {}

    if (!maricultor_id || !amount_total || !start_period || !end_period) {
      return NextResponse.json(
        { error: "maricultor_id, amount_total, start_period e end_period são obrigatórios" },
        { status: 400 }
      )
    }

    const total = Number(amount_total)
    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ error: "amount_total inválido" }, { status: 400 })
    }

    if (Math.round(total * 100) % Math.round(MONTHLY_FEE * 100) !== 0) {
      return NextResponse.json(
        { error: `O valor precisa ser múltiplo de R$ ${MONTHLY_FEE},00.` },
        { status: 400 }
      )
    }

    const installments = Math.round(total / MONTHLY_FEE)
    if (installments > MAX_ALLOCATIONS) {
      return NextResponse.json(
        { error: `Máximo de ${MAX_ALLOCATIONS} mensalidades por lançamento em lote.` },
        { status: 400 }
      )
    }

    const start = parsePeriod(String(start_period))
    const end = parsePeriod(String(end_period))
    if (!start || !end) {
      return NextResponse.json({ error: "Período inválido" }, { status: 400 })
    }

    const startKey = monthKey(start.year, start.month)
    const endKey = monthKey(end.year, end.month)
    if (startKey > endKey) {
      return NextResponse.json({ error: "Período inicial deve ser menor ou igual ao final." }, { status: 400 })
    }

    const method =
      payment_method && PAYMENT_METHODS.includes(payment_method as any) ? payment_method : "outros"
    const strategy: "forward" | "backward" =
      overflow_strategy === "backward" ? "backward" : "forward"

    const supabase = getSupabaseAdmin()
    const { data: existingPayments, error: existingError } = await supabase
      .from("maricultor_monthly_payments")
      .select("id, year, month, amount, payment_method")
      .eq("maricultor_id", maricultor_id)

    if (existingError) {
      console.error(existingError)
      return NextResponse.json({ error: "Erro ao buscar pagamentos existentes." }, { status: 500 })
    }

    const existingByKey = new Map<number, ExistingPayment>()
    for (const item of existingPayments || []) {
      existingByKey.set(monthKey(item.year, item.month), item)
    }

    const selectedKeys: number[] = []
    for (let k = startKey; k <= endKey; k++) selectedKeys.push(k)

    const pendingInRange = selectedKeys.filter((k) => !existingByKey.has(k))
    const allocations: number[] = []

    for (const k of pendingInRange) {
      if (allocations.length >= installments) break
      allocations.push(k)
    }

    let cursor = strategy === "forward" ? endKey + 1 : startKey - 1
    while (allocations.length < installments) {
      if (cursor < monthKey(MIN_YEAR, 1) || cursor > monthKey(MAX_YEAR, 12)) break
      if (!existingByKey.has(cursor) && !allocations.includes(cursor)) {
        allocations.push(cursor)
      }
      cursor += strategy === "forward" ? 1 : -1
    }

    if (allocations.length < installments) {
      return NextResponse.json(
        { error: "Não foi possível alocar todas as mensalidades nesse intervalo/estratégia." },
        { status: 400 }
      )
    }

    const paidAtValue = method === "isento" ? (paid_at || null) : paid_at || new Date().toISOString()
    const notePrefix =
      notes && String(notes).trim().length > 0
        ? String(notes).trim()
        : `Pagamento em lote: R$ ${total.toFixed(2).replace(".", ",")} (${installments} mensalidades).`

    const rows = allocations.map((key) => {
      const { year, month } = fromMonthKey(key)
      return {
        maricultor_id,
        year,
        month,
        amount: method === "isento" ? null : MONTHLY_FEE,
        payment_method: method,
        paid_at: paidAtValue,
        notes: `${notePrefix} Competência ${formatCompetence(year, month)}.`,
        marked_by: auth.userId,
        updated_at: new Date().toISOString(),
      }
    })

    const { data: saved, error: saveError } = await supabase
      .from("maricultor_monthly_payments")
      .upsert(rows, { onConflict: "maricultor_id,year,month" })
      .select("id, year, month")

    if (saveError) {
      console.error(saveError)
      return NextResponse.json({ error: saveError.message || "Erro ao salvar pagamento em lote" }, { status: 500 })
    }

    const labels = allocations
      .map((key) => {
        const { year, month } = fromMonthKey(key)
        return formatCompetence(year, month)
      })
      .sort((a, b) => {
        const [ma, ya] = a.split("/")
        const [mb, yb] = b.split("/")
        return Number(ya) === Number(yb) ? Number(ma) - Number(mb) : Number(ya) - Number(yb)
      })

    return NextResponse.json({
      success: true,
      installments_allocated: allocations.length,
      monthly_fee: MONTHLY_FEE,
      total_amount: total,
      overflow_strategy: strategy,
      competencies: labels,
      records_saved: saved?.length ?? 0,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
