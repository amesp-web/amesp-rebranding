import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function ensureAdmin() {
  const supabaseServer = await createServerClient()
  const { data: { user }, error: authError } = await supabaseServer.auth.getUser()
  if (authError || !user) return { error: 'Não autenticado', status: 401 as const }
  const { data: adminProfile } = await supabaseServer
    .from('admin_profiles')
    .select('id, is_active')
    .eq('id', user.id)
    .single()
  if (!adminProfile?.is_active) return { error: 'Acesso negado', status: 403 as const }
  return { ok: true as const }
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

/** GET /api/admin/payments/monthly-stats
 *  Receita total por mês nos últimos 12 meses (para gráfico do dashboard).
 */
export async function GET() {
  try {
    const auth = await ensureAdmin()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const supabase = getSupabaseAdmin()
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    const months: { year: number; month: number; total: number; label: string }[] = []
    for (let i = 0; i < 12; i++) {
      let y = currentYear
      let m = currentMonth - i
      while (m < 1) {
        m += 12
        y -= 1
      }
      months.push({
        year: y,
        month: m,
        total: 0,
        label: `${MONTH_NAMES[m - 1]}/${String(y).slice(2)}`,
      })
    }

    const { data: payments, error } = await supabase
      .from('maricultor_monthly_payments')
      .select('year, month, amount, payment_method')
      .in('payment_method', ['dinheiro', 'pix', 'peixe', 'materiais', 'outros'])

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Erro ao buscar pagamentos' }, { status: 500 })
    }

    const key = (y: number, m: number) => `${y}-${m}`
    const totals = new Map<string, number>()
    for (const p of payments || []) {
      if (p.payment_method === 'isento') continue
      const k = key(p.year, p.month)
      totals.set(k, (totals.get(k) || 0) + (Number(p.amount) || 0))
    }

    for (const row of months) {
      row.total = totals.get(key(row.year, row.month)) || 0
    }

    return NextResponse.json({ months: months.reverse() })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
