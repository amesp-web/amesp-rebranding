import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const BUCKET = 'maricultor_documents'
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

const DOCUMENT_TYPES = ['rg', 'cpf', 'comprovante_endereco', 'cnh', 'cessao_aguas', 'outros'] as const

/** Apenas "outros" permite múltiplos documentos; os demais tipos são um por maricultor */
const SINGLE_PER_TYPE = ['rg', 'cpf', 'comprovante_endereco', 'cnh', 'cessao_aguas'] as const

const TYPE_LABELS: Record<string, string> = {
  rg: 'RG',
  cpf: 'CPF',
  comprovante_endereco: 'Comprovante de endereço',
  cnh: 'CNH',
  cessao_aguas: 'Cessão de Águas',
  outros: 'Outros',
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100)
}

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

export async function GET(
  _request: NextRequest,
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

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: rows, error } = await supabase
      .from('maricultor_documents')
      .select('id, type, label, file_path, file_name, content_type, file_size_bytes, created_at')
      .eq('maricultor_id', maricultorId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao listar documentos:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Não gerar signed URLs na listagem (melhora performance); URL é obtida sob demanda no GET /documents/[docId]
    const documents = (rows ?? []).map((doc) => ({
      ...doc,
      signed_url: null as string | null,
    }))

    return NextResponse.json({ documents })
  } catch (err: unknown) {
    console.error('Erro GET documentos:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}

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

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const formData = await request.formData()
    const outrosLabel = (formData.get('outros_label') as string)?.trim() || null

    const uploaded: { type: string; file_name: string }[] = []

    for (const type of DOCUMENT_TYPES) {
      const file = formData.get(type) as File | null
      if (!file || !file.size || file.size === 0) continue

      // Tipos fixos (RG, CPF, etc.): apenas um por maricultor; "outros" pode ter vários
      if (SINGLE_PER_TYPE.includes(type as any)) {
        const { data: existing } = await supabase
          .from('maricultor_documents')
          .select('id')
          .eq('maricultor_id', maricultorId)
          .eq('type', type)
          .maybeSingle()
        if (existing) {
          const label = TYPE_LABELS[type] || type
          return NextResponse.json(
            {
              error: `Já existe um documento do tipo "${label}" para este maricultor. Remova o existente para adicionar outro.`,
            },
            { status: 409 }
          )
        }
      }

      const contentType = file.type || 'application/octet-stream'
      if (!ALLOWED_TYPES.includes(contentType)) {
        return NextResponse.json(
          { error: `Tipo de arquivo não permitido para ${type}: ${contentType}` },
          { status: 400 }
        )
      }
      if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { error: `Arquivo muito grande para ${type} (máx. 10 MB)` },
          { status: 400 }
        )
      }

      const ext = file.name.split('.').pop() || 'bin'
      const safeName = sanitizeFileName(file.name)
      const filePath = `${maricultorId}/${type}_${Date.now()}_${safeName}`

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, {
          contentType,
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Erro upload storage:', uploadError)
        return NextResponse.json(
          { error: `Erro ao enviar arquivo ${type}: ${uploadError.message}` },
          { status: 500 }
        )
      }

      const { error: insertError } = await supabase.from('maricultor_documents').insert({
        maricultor_id: maricultorId,
        type,
        label: type === 'outros' ? outrosLabel : null,
        file_path: filePath,
        file_name: file.name,
        content_type: contentType,
        file_size_bytes: file.size,
      })

      if (insertError) {
        console.error('Erro insert documento:', insertError)
        await supabase.storage.from(BUCKET).remove([filePath])
        return NextResponse.json(
          { error: `Erro ao registrar documento ${type}` },
          { status: 500 }
        )
      }

      uploaded.push({ type, file_name: file.name })
    }

    return NextResponse.json({
      success: true,
      count: uploaded.length,
      uploaded,
    })
  } catch (err: unknown) {
    console.error('Erro POST documentos:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
