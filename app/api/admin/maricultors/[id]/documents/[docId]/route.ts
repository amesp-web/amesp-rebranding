import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const BUCKET = 'maricultor_documents'

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

/** GET: redireciona para signed URL do documento (download/preview sob demanda, evita N chamadas na listagem) */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const auth = await ensureAdmin()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { id: maricultorId, docId } = await params
    if (!maricultorId || !docId)
      return NextResponse.json({ error: 'ID do maricultor e do documento são obrigatórios' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey)
      return NextResponse.json({ error: 'Configuração ausente' }, { status: 500 })

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: doc, error: fetchError } = await supabase
      .from('maricultor_documents')
      .select('id, file_path')
      .eq('id', docId)
      .eq('maricultor_id', maricultorId)
      .single()

    if (fetchError || !doc?.file_path) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })
    }

    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(doc.file_path, 3600)

    if (!signed?.signedUrl) {
      return NextResponse.json({ error: 'Erro ao gerar link do documento' }, { status: 500 })
    }

    return NextResponse.redirect(signed.signedUrl, 302)
  } catch (err: unknown) {
    console.error('Erro GET documento:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const auth = await ensureAdmin()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { id: maricultorId, docId } = await params
    if (!maricultorId || !docId)
      return NextResponse.json({ error: 'ID do maricultor e do documento são obrigatórios' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey)
      return NextResponse.json({ error: 'Configuração ausente' }, { status: 500 })

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: doc, error: fetchError } = await supabase
      .from('maricultor_documents')
      .select('id, file_path')
      .eq('id', docId)
      .eq('maricultor_id', maricultorId)
      .single()

    if (fetchError || !doc) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })
    }

    if (doc.file_path) {
      await supabase.storage.from(BUCKET).remove([doc.file_path])
    }

    const { error: deleteError } = await supabase
      .from('maricultor_documents')
      .delete()
      .eq('id', docId)
      .eq('maricultor_id', maricultorId)

    if (deleteError) {
      console.error('Erro ao remover documento:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Erro DELETE documento:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
