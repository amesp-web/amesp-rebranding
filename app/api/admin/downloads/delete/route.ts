import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ Variáveis de ambiente do Supabase ausentes.')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Buscar o download para pegar o file_url e deletar do Storage
    const { data: download, error: fetchError } = await supabase
      .from('downloads')
      .select('file_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('❌ Erro ao buscar download:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Deletar arquivo do Storage
    if (download?.file_url) {
      const filePath = download.file_url.split('/downloads/').pop()
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('downloads')
          .remove([filePath])

        if (storageError) {
          console.warn('⚠️ Erro ao deletar arquivo do Storage:', storageError)
          // Continua mesmo se falhar o delete do Storage
        }
      }
    }

    // Deletar registro do banco
    const { error: deleteError } = await supabase
      .from('downloads')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('❌ Erro ao deletar download:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Erro inesperado ao deletar download:', error)
    return NextResponse.json({ error: error.message || 'Erro inesperado' }, { status: 500 })
  }
}

