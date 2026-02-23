import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const PAYMENT_METHODS = ['dinheiro', 'pix', 'peixe', 'materiais', 'outros', 'isento'] as const

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
  return { ok: true as const, userId: user.id }
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/** GET /api/admin/payments?year=2026
 *  Retorna maricultores (ativos) com monthly_fee_amount, association_date e pagamentos do ano.
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

    const { data: producers, error: producersError } = await supabase
      .from('maricultor_profiles')
      .select('id, full_name, monthly_fee_amount, association_date, fee_exempt, created_at')
      .eq('is_active', true)
      .order('full_name')

    if (producersError) {
      console.error(producersError)
      return NextResponse.json({ error: 'Erro ao buscar maricultores' }, { status: 500 })
    }

    const { data: payments, error: paymentsError } = await supabase
      .from('maricultor_monthly_payments')
      .select('id, maricultor_id, year, month, amount, payment_method, paid_at, notes')
      .eq('year', year)

    if (paymentsError) {
      console.error(paymentsError)
      return NextResponse.json({ error: 'Erro ao buscar pagamentos' }, { status: 500 })
    }

    const paymentsByKey = new Map<string, typeof payments[0]>()
    for (const p of payments || []) {
      paymentsByKey.set(`${p.maricultor_id}-${p.month}`, p)
    }

    const maricultors = (producers || []).map((m) => ({
      id: m.id,
      full_name: m.full_name,
      monthly_fee_amount: m.monthly_fee_amount ?? null,
      association_date: m.association_date ?? null,
      fee_exempt: !!m.fee_exempt,
      created_at: m.created_at,
      payments: Array.from({ length: 12 }, (_, i) => {
        const month = i + 1
        return paymentsByKey.get(`${m.id}-${month}`) ?? null
      }),
    }))

    return NextResponse.json({ year, maricultors })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/** POST /api/admin/payments - Registrar pagamento */
export async function POST(request: NextRequest) {
  try {
    const auth = await ensureAdmin()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const { maricultor_id, year, month, amount, payment_method, paid_at, notes } = body

    if (!maricultor_id || !year || !month) {
      return NextResponse.json(
        { error: 'maricultor_id, year e month são obrigatórios' },
        { status: 400 }
      )
    }
    const monthNum = parseInt(String(month), 10)
    if (monthNum < 1 || monthNum > 12) {
      return NextResponse.json({ error: 'month deve ser entre 1 e 12' }, { status: 400 })
    }
    const yearNum = parseInt(String(year), 10)
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return NextResponse.json({ error: 'year inválido' }, { status: 400 })
    }

    const method = payment_method && PAYMENT_METHODS.includes(payment_method as any)
      ? payment_method
      : 'outros'

    const supabase = getSupabaseAdmin()

    const { data: row, error } = await supabase
      .from('maricultor_monthly_payments')
      .upsert(
        {
          maricultor_id,
          year: yearNum,
          month: monthNum,
          amount: amount != null ? Number(amount) : null,
          payment_method: method,
          paid_at: method === 'isento' ? (paid_at || null) : (paid_at || new Date().toISOString()),
          marked_by: auth.userId,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'maricultor_id,year,month' }
      )
      .select('id, maricultor_id, year, month, amount, payment_method, paid_at, notes')
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: error.message || 'Erro ao salvar pagamento' }, { status: 500 })
    }

    return NextResponse.json(row)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
