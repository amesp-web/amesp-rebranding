import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const BUCKET = 'maricultor_logos'
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

async function ensureAdmin() {
  const supabaseServer = await createServerClient()
  const { data: { user }, error: authError } = await supabaseServer.auth.getUser()
  if (authError || !user) return { error: 'Não autenticado', status: 401 as const }
  const { data: adminProfile, error: profileError } = await supabaseServer
    .from('admin_profiles')
    .select('id, is_active')
    .eq('id', user.id)
    .single()
  if (profileError || !adminProfile || !adminProfile.is_active)
    return { error: 'Acesso negado', status: 403 as const }
  return { ok: true as const }
}

function getExt(mime: string): string {
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

/** POST: upload de logo (multipart/form-data, campo "logo") */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await ensureAdmin()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { id: maricultorId } = await params
    if (!maricultorId)
      return NextResponse.json({ error: 'ID do maricultor é obrigatório' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey)
      return NextResponse.json({ error: 'Configuração ausente' }, { status: 500 })

    const formData = await request.formData()
    const file = formData.get('logo')
    if (!file || !(file instanceof File))
      return NextResponse.json({ error: 'Envie um arquivo no campo "logo"' }, { status: 400 })

    if (file.size > MAX_SIZE_BYTES)
      return NextResponse.json({ error: 'Arquivo deve ter no máximo 2 MB' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: 'Formato inválido. Use JPEG, PNG ou WebP.' }, { status: 400 })

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const ext = getExt(file.type)
    const storagePath = `${maricultorId}/logo.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      console.error('Erro ao fazer upload da logo:', uploadError)
      return NextResponse.json({ error: uploadError.message || 'Erro ao enviar logo' }, { status: 500 })
    }

    const { error: profileError } = await supabase
      .from('maricultor_profiles')
      .update({ logo_path: storagePath, updated_at: new Date().toISOString() })
      .eq('id', maricultorId)

    if (profileError) {
      console.error('Erro ao atualizar logo_path:', profileError)
      return NextResponse.json({ error: 'Erro ao salvar referência da logo' }, { status: 500 })
    }

    return NextResponse.json({ success: true, logo_path: storagePath })
  } catch (e: unknown) {
    console.error('Erro em POST /logo:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erro ao enviar logo' },
      { status: 500 }
    )
  }
}

/** DELETE: remover logo (apaga do storage e zera logo_path) */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await ensureAdmin()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { id: maricultorId } = await params
    if (!maricultorId)
      return NextResponse.json({ error: 'ID do maricultor é obrigatório' }, { status: 400 })

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey)
      return NextResponse.json({ error: 'Configuração ausente' }, { status: 500 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: profile } = await supabase
      .from('maricultor_profiles')
      .select('logo_path')
      .eq('id', maricultorId)
      .single()

    if (profile?.logo_path) {
      await supabase.storage.from(BUCKET).remove([profile.logo_path])
    }

    await supabase
      .from('maricultor_profiles')
      .update({ logo_path: null, updated_at: new Date().toISOString() })
      .eq('id', maricultorId)

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    console.error('Erro em DELETE /logo:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erro ao remover logo' },
      { status: 500 }
    )
  }
}
