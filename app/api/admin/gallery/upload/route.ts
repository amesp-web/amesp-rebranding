import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação do usuário
    const supabaseServer = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se o usuário é admin
    const { data: adminProfile, error: profileError } = await supabaseServer
      .from('admin_profiles')
      .select('id, is_active')
      .eq('id', user.id)
      .single()

    if (profileError || !adminProfile || !adminProfile.is_active) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const featured = formData.get('featured') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Configuração Supabase ausente' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Ler o buffer da imagem
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Redimensionar baseado no tipo
    let processedBuffer: Buffer
    const isFeatured = featured

    if (isFeatured) {
      // Imagem grande: 2:1 landscape (1600x800)
      processedBuffer = await sharp(buffer)
        .resize(1600, 800, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 85 })
        .toBuffer()
    } else {
      // Imagem pequena: 1:1 quadrada (800x800)
      processedBuffer = await sharp(buffer)
        .resize(800, 800, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 85 })
        .toBuffer()
    }

    // Nome do arquivo
    const fileExt = 'jpg'
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `gallery/${fileName}`

    // Fazer upload para Supabase Storage (bucket 'gallery')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, processedBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError)
      return NextResponse.json({ error: 'Erro ao fazer upload: ' + uploadError.message }, { status: 500 })
    }

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from('gallery').getPublicUrl(filePath)

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
    })
  } catch (error: any) {
    console.error('Erro no upload de galeria:', error)
    return NextResponse.json({ error: error.message || 'Erro ao processar imagem' }, { status: 500 })
  }
}

