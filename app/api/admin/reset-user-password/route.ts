// app/api/admin/reset-user-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { userId, tempPassword } = await request.json()
    
    console.log('🔄 Resetando senha do usuário:', userId)
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Configuração do Supabase não encontrada' }, { status: 500 })
    }

    // Criar cliente Supabase com service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Atualizar senha do usuário no auth.users
    console.log('🔑 Atualizando senha no auth.users...')
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: tempPassword }
    )

    if (updateError) {
      console.error('❌ Erro ao atualizar senha:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    console.log('✅ Senha atualizada com sucesso!')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Senha temporária atualizada com sucesso',
      user: updateData.user
    })

  } catch (error: any) {
    console.error('❌ Erro na API reset-user-password:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
