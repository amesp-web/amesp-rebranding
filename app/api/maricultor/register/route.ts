// app/api/maricultor/register/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      id, // auth.users id do maricultor
      full_name,
      phone,
      logradouro,
      cidade,
      estado,
      company,
      specialties,
      latitude,
      longitude,
    } = body || {}

    if (!id || !full_name) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes (id, full_name)' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Variáveis de ambiente do Supabase ausentes' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const { error } = await supabase
      .from('maricultor_profiles')
      .upsert({
        id,
        full_name,
        phone,
        logradouro,
        cidade,
        estado,
        company,
        specialties,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro inesperado' }, { status: 500 })
  }
}


