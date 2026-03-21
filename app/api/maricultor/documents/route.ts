import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const TYPE_LABELS: Record<string, string> = {
  rg: "RG",
  cpf: "CPF",
  comprovante_endereco: "Comprovante de endereço",
  cnh: "CNH",
  cessao_aguas: "Cessão de Águas",
  outros: "Outros",
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

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

    const supabase = getSupabaseAdmin()
    const { data: rows, error } = await supabase
      .from("maricultor_documents")
      .select("id, type, label, file_name, content_type, file_size_bytes, created_at")
      .eq("maricultor_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao listar documentos do maricultor:", error)
      return NextResponse.json({ error: "Erro ao carregar documentos" }, { status: 500 })
    }

    const documents = (rows || []).map((doc) => ({
      ...doc,
      type_label: doc.type === "outros" ? doc.label || TYPE_LABELS.outros : TYPE_LABELS[doc.type] || doc.type,
    }))

    return NextResponse.json({ documents })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
