import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const BUCKET = "maricultor_documents"

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const supabaseServer = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { docId } = await params
    if (!docId) {
      return NextResponse.json({ error: "Documento inválido" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: doc, error: fetchError } = await supabase
      .from("maricultor_documents")
      .select("id, file_path")
      .eq("id", docId)
      .eq("maricultor_id", user.id)
      .single()

    if (fetchError || !doc?.file_path) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 })
    }

    const { data: signed, error: signedError } = await supabase.storage.from(BUCKET).createSignedUrl(doc.file_path, 3600)
    if (signedError || !signed?.signedUrl) {
      return NextResponse.json({ error: "Erro ao gerar link do documento" }, { status: 500 })
    }

    return NextResponse.redirect(signed.signedUrl, 302)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
