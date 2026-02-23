import { NextRequest, NextResponse } from 'next/server'
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

/** GET /api/admin/payments/summary?year=2026
 *  Totais por forma de pagamento no ano.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await ensureAdmin()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10)
    if (isNaN(year) || year < 2000 || year > 2100)
      return NextResponse.json({ error: 'Ano inválido' }, { status: 400 })

    const supabase = getSupabaseAdmin()

    const { data: payments, error } = await supabase
      .from('maricultor_monthly_payments')
      .select('amount, payment_method')
      .eq('year', year)

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Erro ao buscar resumo' }, { status: 500 })
    }

    const byMethod: Record<string, number> = {
      dinheiro: 0,
      pix: 0,
      peixe: 0,
      materiais: 0,
      outros: 0,
      isento: 0,
    }
    let total = 0
    let isentoCount = 0
    for (const p of payments || []) {
      const method = p.payment_method || 'outros'
      const amount = Number(p.amount) || 0
      if (method === 'isento') {
        byMethod.isento += 1
        isentoCount += 1
        continue
      }
      if (!(method in byMethod)) byMethod.outros += amount
      else byMethod[method] += amount
      total += amount
    }

    const { count } = await supabase
      .from('maricultor_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    return NextResponse.json({
      year,
      total,
      by_method: byMethod,
      isento_count: isentoCount,
      active_maricultors_count: count ?? 0,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
