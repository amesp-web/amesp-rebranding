"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, FileText, Upload, X, ImageIcon } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { createBrowserClient } from "@supabase/ssr"

export default function EditDownloadPage() {
  const router = useRouter()
  const params = useParams()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fileName, setFileName] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [coverFileName, setCoverFileName] = useState<string | null>(null)
  const [selectedCover, setSelectedCover] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [removeCover, setRemoveCover] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchDownload = async () => {
      try {
        const res = await fetch(`/api/admin/downloads`)
        if (!res.ok) throw new Error('Erro ao buscar downloads')

        const downloads = await res.json()
        const download = downloads.find((d: any) => d.id === params.id)

        if (download) {
          setTitle(download.title)
          setDescription(download.description || '')
          setFileName(download.file_name)
          setCoverUrl(download.cover_url || null)
          setCoverFileName(download.cover_file_name || null)
        } else {
          toast.error('Manual não encontrado')
          router.push('/admin/downloads')
        }
      } catch (error) {
        console.error('Erro ao carregar manual:', error)
        toast.error('Erro ao carregar manual')
      } finally {
        setLoading(false)
      }
    }

    fetchDownload()
  }, [params.id, router])

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('A capa deve ser uma imagem (JPG, PNG ou WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Capa muito grande! Máximo: 5MB')
      return
    }

    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setSelectedCover(file)
    setCoverPreview(URL.createObjectURL(file))
    setRemoveCover(false)
  }

  const clearNewCover = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setSelectedCover(null)
    setCoverPreview(null)
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  const uploadCover = async (file: File) => {
    const storageName = `${Date.now()}-cover-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`
    const filePath = `covers/${storageName}`

    const { error: uploadError } = await supabase.storage
      .from('downloads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      })

    if (uploadError) {
      console.error('Erro no upload da capa:', uploadError)
      throw new Error('Erro ao fazer upload da capa')
    }

    const { data: { publicUrl } } = supabase.storage.from('downloads').getPublicUrl(filePath)
    return { publicUrl, fileName: file.name, filePath }
  }

  const removeCoverFromStorage = async (url: string | null) => {
    if (!url) return
    const filePath = url.split('/downloads/').pop()
    if (!filePath) return
    await supabase.storage.from('downloads').remove([filePath])
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const activeCoverPreview = coverPreview || (!removeCover ? coverUrl : null)

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Título é obrigatório')
      return
    }

    setSaving(true)

    try {
      let nextCoverUrl: string | null | undefined = undefined
      let nextCoverFileName: string | null | undefined = undefined

      if (selectedCover) {
        const uploaded = await uploadCover(selectedCover)
        if (coverUrl && coverUrl !== uploaded.publicUrl) {
          await removeCoverFromStorage(coverUrl)
        }
        nextCoverUrl = uploaded.publicUrl
        nextCoverFileName = uploaded.fileName
      } else if (removeCover) {
        if (coverUrl) {
          await removeCoverFromStorage(coverUrl)
        }
        nextCoverUrl = null
        nextCoverFileName = null
      }

      const res = await fetch('/api/admin/downloads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: params.id,
          title: title.trim(),
          description: description.trim() || null,
          ...(nextCoverUrl !== undefined
            ? { cover_url: nextCoverUrl, cover_file_name: nextCoverFileName }
            : {}),
        }),
      })

      if (!res.ok) {
        throw new Error('Erro ao atualizar manual')
      }

      toast.success('Manual atualizado com sucesso!')
      router.push('/admin/downloads')
      router.refresh()
    } catch (error: any) {
      console.error('Erro ao atualizar manual:', error)
      toast.error(error.message || 'Erro ao atualizar manual')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 border-0 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Editar Manual</h1>
              <p className="text-white/90">Atualize as informações e a capa do manual</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-xl">
        <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações do Manual
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Arquivo Atual</label>
            <div className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{fileName}</p>
                  <p className="text-sm text-muted-foreground">Para alterar o arquivo, crie um novo manual</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Título do Manual *</label>
            <Input
              placeholder="Ex: Manual de Boas Práticas na Maricultura"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 focus:ring-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Descrição (opcional)</label>
            <Textarea
              placeholder="Descreva brevemente o conteúdo do manual..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="border-2 focus:ring-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Capa personalizada</label>
            <p className="text-xs text-muted-foreground mb-3">
              Mantém o mesmo visual da página pública: altura de 320px e largura do card. Recomendado ~800×640px (4:3).
            </p>
            <input
              ref={coverInputRef}
              type="file"
              onChange={handleCoverSelect}
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/webp"
            />

            {activeCoverPreview ? (
              <div className="border-2 border-purple-200 rounded-xl overflow-hidden bg-white">
                <div className="relative w-full overflow-hidden bg-slate-100" style={{ height: '320px' }}>
                  <img
                    src={activeCoverPreview}
                    alt="Prévia da capa"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50/30 gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {selectedCover?.name || coverFileName || 'Capa atual'}
                    </p>
                    {selectedCover && (
                      <p className="text-sm text-muted-foreground">{formatFileSize(selectedCover.size)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Trocar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => {
                        clearNewCover()
                        setRemoveCover(true)
                      }}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-purple-400 hover:bg-purple-50/50 transition-all"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-900">Clique para enviar a capa</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sem capa, a página usa preview do PDF ou ícone padrão
                    </p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/downloads')}
          disabled={saving}
          className="flex-1 border-2 border-gray-300 hover:border-gray-400 rounded-xl transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving || !title.trim()}
          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-150 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
