import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const { id, imageUrl } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID da imagem é obrigatório' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Configuração do Supabase ausente' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Tentar remover o arquivo do bucket se tivermos a URL
    if (imageUrl && typeof imageUrl === 'string') {
      try {
        // URL pública: {supabaseUrl}/storage/v1/object/public/gallery/<path>
        const marker = '/storage/v1/object/public/'
        const idx = imageUrl.indexOf(marker)
        if (idx !== -1) {
          const after = imageUrl.substring(idx + marker.length) // gallery/<path>
          const firstSlash = after.indexOf('/')
          if (firstSlash !== -1) {
            const bucket = after.substring(0, firstSlash)
            const filePath = after.substring(firstSlash + 1)
            if (bucket === 'gallery' && filePath) {
              await supabase.storage.from('gallery').remove([filePath])
            }
          }
        }
      } catch (e) {
        // Não falhar a requisição se remoção do storage der erro; seguimos removendo o registro
        console.warn('Falha ao remover arquivo do storage da galeria:', e)
      }
    }

    // Remover registro na tabela
    const { error } = await supabase.from('gallery').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro inesperado' }, { status: 500 })
  }
}


