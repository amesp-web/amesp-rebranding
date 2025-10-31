"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Link from "next/link"
import { FolderTree, ArrowLeft, Save, Eye } from "lucide-react"
import { ProjectEditor } from "@/components/admin/ProjectEditor"
import { ProjectPreview } from "@/components/admin/ProjectPreview"

export default function NewProjectPage() {
  const [name, setName] = useState("")
  const [submenuLabel, setSubmenuLabel] = useState("")
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [blocks, setBlocks] = useState<any[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)

  const supabase = createClient()

  const onSubmit = async () => {
    if (!name.trim()) return toast.error('Informe o nome do projeto')
    if (!submenuLabel.trim()) return toast.error('Informe o rótulo do submenu')
    
    setLoading(true)
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          submenu_label: submenuLabel,
          content: { blocks },
          published,
        }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error?.error || 'Erro ao criar projeto')
      }
      
      toast.success('Projeto criado!')
      window.location.href = '/admin/projects'
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao criar projeto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header moderno */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 shadow-xl">
        <div className="relative flex items-center">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <FolderTree className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Novo Projeto</h1>
              <p className="text-white/90">Crie um projeto socioambiental</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações básicas */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-cyan-50/50 to-teal-50/30 border-b border-blue-200/50">
          <CardTitle className="text-xl font-bold text-slate-800">Informações do Projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome do Projeto *</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!submenuLabel) setSubmenuLabel(e.target.value)
                }}
                placeholder="Ex: Fase 1 Mar é Cultura"
              />
            </div>
            <div>
              <Label>Rótulo do Submenu *</Label>
              <Input
                value={submenuLabel}
                onChange={(e) => setSubmenuLabel(e.target.value)}
                placeholder="Ex: Projeto Mar é Cultura - Fase 1"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <Switch id="published" checked={published} onCheckedChange={setPublished} />
            <Label htmlFor="published">Publicar imediatamente</Label>
          </div>
        </CardContent>
      </Card>

      {/* Editor de blocos */}
      <ProjectEditor blocks={blocks} setBlocks={setBlocks} />

      {/* Rodapé com ações */}
      <div className="mt-8 pt-6 border-t border-blue-200/50 flex items-center justify-between">
        <Button variant="outline" asChild className="border-2 border-gray-300 hover:border-gray-400 rounded-xl px-6 py-2 transition-all duration-300">
          <Link href="/admin/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Link>
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setPreviewOpen(true)}
            variant="outline"
            className="border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl px-6 py-2 transition-all duration-300"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            onClick={onSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-150 rounded-xl px-6 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar projeto'}
          </Button>
        </div>
      </div>

      {/* Modal Preview */}
      <ProjectPreview blocks={blocks} isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />
    </div>
  )
}

