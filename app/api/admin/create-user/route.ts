// app/api/admin/create-user/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { full_name, email, phone, role } = await request.json()

    // Criar cliente Supabase com service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Gerar senha temporária
    const tempPassword = generateTemporaryPassword()

    // Criar usuário
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        phone
      }
    })

    if (error) {
      console.error('Erro ao criar usuário:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Criar perfil admin
    const { error: profileError } = await supabase
      .from('admin_profiles')
      .insert({
        id: data.user.id,
        full_name,
        role
      })

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      user: data.user,
      tempPassword 
    })

  } catch (error: any) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
