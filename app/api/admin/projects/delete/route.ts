import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

    // Buscar projeto para deletar imagens do Storage
    const { data: project } = await supabase
      .from('projects')
      .select('content')
      .eq('id', id)
      .single()

    // Deletar imagens do Storage se houver
    if (project?.content?.blocks) {
      const blocks = project.content.blocks || []
      const imagesToDelete: string[] = []

      blocks.forEach((block: any) => {
        if (block.type === 'banner' && block.data?.image_url) {
          const url = block.data.image_url
          const path = url.split('/storage/v1/object/public/projects/')[1]
          if (path) imagesToDelete.push(path)
        }
        if (block.type === 'photo' && block.data?.image_url) {
          const url = block.data.image_url
          const path = url.split('/storage/v1/object/public/projects/')[1]
          if (path) imagesToDelete.push(path)
        }
        if (block.type === 'gallery' && block.data?.images) {
          block.data.images.forEach((img: string) => {
            const path = img.split('/storage/v1/object/public/projects/')[1]
            if (path) imagesToDelete.push(path)
          })
        }
        if (block.type === 'sponsors' && block.data?.logos) {
          block.data.logos.forEach((img: string) => {
            const path = img.split('/storage/v1/object/public/projects/')[1]
            if (path) imagesToDelete.push(path)
          })
        }
        if (block.type === 'logos' && block.data?.logo_url) {
          const url = block.data.logo_url
          const path = url.split('/storage/v1/object/public/projects/')[1]
          if (path) imagesToDelete.push(path)
        }
      })

      // Deletar arquivos do Storage
      for (const path of imagesToDelete) {
        await supabase.storage.from('projects').remove([path])
      }
    }

    // Deletar projeto
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}

