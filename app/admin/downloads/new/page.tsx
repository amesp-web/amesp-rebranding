"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Upload, FileText, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createBrowserClient } from "@supabase/ssr"

export default function NewDownloadPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamanho (50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Arquivo muito grande! Máximo: 50MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Título é obrigatório')
      return
    }

    if (!selectedFile) {
      toast.error('Selecione um arquivo')
      return
    }

    setUploading(true)

    try {
      // 1. Upload do arquivo para o Supabase Storage
      const fileName = `${Date.now()}-${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`
      const filePath = `downloads/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('downloads')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Erro no upload:', uploadError)
        throw new Error('Erro ao fazer upload do arquivo')
      }

      // 2. Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('downloads')
        .getPublicUrl(filePath)

      // 3. Criar registro no banco
      const res = await fetch('/api/admin/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          file_url: publicUrl,
          file_name: selectedFile.name,
          file_size: selectedFile.size
        })
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('Erro ao criar download:', errorText)
        throw new Error('Erro ao salvar manual no banco de dados')
      }

      toast.success('Manual adicionado com sucesso!')
      router.push('/admin/downloads')
      router.refresh()
    } catch (error: any) {
      console.error('Erro ao adicionar manual:', error)
      toast.error(error.message || 'Erro ao adicionar manual')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 border-0 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Adicionar Novo Manual</h1>
              <p className="text-white/90">Faça upload de manuais e arquivos para download</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações do Manual
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="text-sm font-medium mb-2 block">Título do Manual *</label>
            <Input
              placeholder="Ex: Manual de Boas Práticas na Maricultura"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 focus:ring-2"
            />
          </div>

          {/* Descrição */}
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

          {/* Upload de Arquivo */}
          <div>
            <label className="text-sm font-medium mb-2 block">Arquivo *</label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.jpg,.jpeg,.png"
            />
            
            {!selectedFile ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-900">Clique para selecionar o arquivo</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PDF, DOC, XLS, ZIP, JPG, PNG (máx. 50MB)
                    </p>
                  </div>
                </div>
              </button>
            ) : (
              <div className="border-2 border-indigo-200 rounded-xl p-4 bg-indigo-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/downloads')}
          disabled={uploading}
          className="flex-1 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={uploading || !title.trim() || !selectedFile}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
        >
          {uploading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Manual
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

