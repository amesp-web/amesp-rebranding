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
  return { ok: true as const }
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/** PUT /api/admin/payments/[id] - Atualizar pagamento */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await ensureAdmin()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { id } = await params
    if (!id) return NextResponse.json({ error: 'ID do pagamento é obrigatório' }, { status: 400 })

    const body = await request.json()
    const { amount, payment_method, paid_at, notes } = body

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (amount !== undefined) updates.amount = amount != null ? Number(amount) : null
    if (payment_method !== undefined) {
      updates.payment_method = payment_method && PAYMENT_METHODS.includes(payment_method as any)
        ? payment_method
        : 'outros'
    }
    if (paid_at !== undefined) updates.paid_at = paid_at || null
    if (notes !== undefined) updates.notes = notes || null

    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('maricultor_monthly_payments')
      .update(updates)
      .eq('id', id)
      .select('id, maricultor_id, year, month, amount, payment_method, paid_at, notes')
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: error.message || 'Erro ao atualizar' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/** DELETE /api/admin/payments/[id] - Remover pagamento */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await ensureAdmin()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { id } = await params
    if (!id) return NextResponse.json({ error: 'ID do pagamento é obrigatório' }, { status: 400 })

    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('maricultor_monthly_payments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)
      return NextResponse.json({ error: error.message || 'Erro ao remover' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
