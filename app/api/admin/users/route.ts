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
        db: { schema: 'public' }
      }
    )

    // Query simples e direta - buscar tudo sem cache
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Normalizar e retornar
    const users = (data || []).map((u: any) => ({
      ...u,
      last_sign_in_at: u.last_sign_in_at || null,
      has_logged_in: Boolean(u.last_sign_in_at),
    }))

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