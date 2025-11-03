"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, FileText } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"

export default function EditDownloadPage() {
  const router = useRouter()
  const params = useParams()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Título é obrigatório')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/admin/downloads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: params.id,
          title: title.trim(),
          description: description.trim() || null
        })
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
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 border-0 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Editar Manual</h1>
              <p className="text-white/90">Atualize as informações do manual</p>
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
          {/* Arquivo atual (read-only) */}
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
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/downloads')}
          disabled={saving}
          className="flex-1 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving || !title.trim()}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
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

