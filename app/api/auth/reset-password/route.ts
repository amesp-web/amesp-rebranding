// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { token, email, newPassword } = await request.json()

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Usar Service Role Key para operações de admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Variáveis de ambiente ausentes')
      return NextResponse.json(
        { success: false, error: 'Configuração do servidor ausente' },
        { status: 500 }
      )
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. Buscar usuário pelo email em auth.users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Erro ao listar usuários:', listError)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar usuário' },
        { status: 500 }
      )
    }

    const user = users?.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 400 }
      )
    }

    // 2. Verificar se o token corresponde (armazenado no user_metadata)
    const storedToken = user.user_metadata?.reset_token_hash
    const storedExpiry = user.user_metadata?.reset_token_expires_at

    if (!storedToken || storedToken !== token) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 400 }
      )
    }

    // 3. Verificar se o token expirou
    const now = new Date()
    const expiresAt = new Date(storedExpiry)
    
    if (now > expiresAt) {
      // Limpar token expirado do user_metadata
      await supabase.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: {
            ...user.user_metadata,
            reset_token_hash: null,
            reset_token_expires_at: null
          }
        }
      )

      return NextResponse.json(
        { success: false, error: 'Token expirado' },
        { status: 400 }
      )
    }

    // 4. Atualizar a senha no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (authError) {
      console.error('Erro ao atualizar senha:', authError)
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar senha' },
        { status: 500 }
      )
    }

    // 5. Limpar token após uso bem-sucedido do user_metadata
    const { error: clearError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          reset_token_hash: null,
          reset_token_expires_at: null
        }
      }
    )

    if (clearError) {
      console.error('Erro ao limpar token:', clearError)
    }

    console.log('✅ Senha redefinida com sucesso para:', email)
    return NextResponse.json({ 
      success: true, 
      message: 'Senha redefinida com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

// Rota GET para validar token
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Usar Service Role Key para operações de admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Variáveis de ambiente ausentes')
      return NextResponse.json(
        { success: false, error: 'Configuração do servidor ausente' },
        { status: 500 }
      )
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Buscar usuário pelo email em auth.users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Erro ao listar usuários:', listError)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar usuário' },
        { status: 500 }
      )
    }

    const user = users?.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 400 }
      )
    }

    // Verificar se o token corresponde (armazenado no user_metadata)
    const storedToken = user.user_metadata?.reset_token_hash
    const storedExpiry = user.user_metadata?.reset_token_expires_at

    if (!storedToken || storedToken !== token) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 400 }
      )
    }

    // Verificar se o token expirou
    const now = new Date()
    const expiresAt = new Date(storedExpiry)
    
    if (now > expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Token expirado' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Token válido' 
    })

  } catch (error) {
    console.error('Erro ao validar token:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

