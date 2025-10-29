// app/api/admin/users/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { 
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { 'Cache-Control': 'no-cache' } }
      }
    )

    // Query IDÊNTICA à de debug que funciona - buscar TUDO
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Normalizar last_sign_in_at e adicionar flag has_logged_in
    const users = (data || []).map((u: any) => {
      const raw = u.last_sign_in_at as string | null
      const iso = raw && !raw.includes('T') ? raw.replace(' ', 'T') : raw
      return {
        ...u,
        last_sign_in_at: iso,
        has_logged_in: Boolean(raw),
      }
    })

    return NextResponse.json(
      { users },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      },
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}