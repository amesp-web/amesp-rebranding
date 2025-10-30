"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

type Feature = { id?: number; title: string; description: string; icon_key: string }

export default function AdminAboutPage() {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [features, setFeatures] = useState<Feature[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/admin/about', { cache: 'no-store' })
      const data = await res.json()
      setTitle(data?.content?.title || '')
      setSubtitle(data?.content?.subtitle || '')
      const defaults: Feature[] = [
        { title: 'Desenvolvimento Sustentável', description: 'Promovemos práticas sustentáveis na maricultura, respeitando o meio ambiente marinho.', icon_key: 'fish' },
        { title: 'Investigação Científica', description: 'Apoiamos pesquisas e estudos para o avanço da maricultura no estado de São Paulo.', icon_key: 'users' },
        { title: 'Organização da Maricultura', description: 'Estruturamos e organizamos o setor para melhor atender produtores e consumidores.', icon_key: 'waves' },
        { title: 'Excelência Reconhecida', description: 'Certificações internacionais e reconhecimento pela qualidade dos nossos serviços.', icon_key: 'award' },
      ]
      setFeatures((data?.features && data.features.length > 0) ? data.features : defaults)
    })()
  }, [])

  const updateFeature = (idx: number, patch: Partial<Feature>) => {
    setFeatures((prev) => {
      const clone = [...prev]
      clone[idx] = { ...clone[idx], ...patch }
      return clone
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      console.log('[ABOUT] Saving content...')
      const payload = { content: { title, subtitle }, features }
      const res = await fetch('/api/admin/about', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      console.log('[ABOUT] Response status:', res.status)
      if (!res.ok) throw new Error('Falha ao salvar')
      alert('Conteúdo salvo com sucesso!')
    } catch (e) {
      console.error(e)
      alert('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const iconHelp = 'Ícones: fish, users, waves, award (ou outro da biblioteca lucide conforme mapeamento da home)'

  const SortableItem = ({ id, children }: { id: number; children: React.ReactNode }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : 1,
    }
    return (
      <div ref={setNodeRef} style={style} className="relative">
        <button {...attributes} {...listeners} className="absolute -left-3 -top-3 bg-white rounded-full p-1 shadow">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        {children}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 shadow-xl">
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-2">Quem Somos</h1>
          <p className="text-blue-50 text-lg">Gerencie os textos exibidos na Home</p>
        </div>
      </div>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/60">
        <CardHeader>
          <CardTitle className="text-xl">Cabeçalho</CardTitle>
          <CardDescription>Label e subtítulo exibidos na home</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Subtítulo</label>
            <Textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/60">
        <CardHeader>
          <CardTitle className="text-xl">Cards (4 itens)</CardTitle>
          <CardDescription>{iconHelp}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DndContext collisionDetection={closestCenter} onDragEnd={(e) => {
            const { active, over } = e
            if (!over || active.id === over.id) return
            const oldIndex = features.findIndex((_, i) => i === active.id)
            const newIndex = features.findIndex((_, i) => i === over.id)
            setFeatures((prev) => arrayMove(prev, oldIndex, newIndex))
          }}>
            <SortableContext items={features.map((_, i) => i)} strategy={verticalListSortingStrategy}>
          {features.map((f, idx) => (
            <SortableItem key={idx} id={idx}>
            <div className="rounded-xl border p-4 bg-background/60 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Card {idx + 1}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input value={f.title} onChange={(e) => updateFeature(idx, { title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea rows={3} value={f.description} onChange={(e) => updateFeature(idx, { description: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Ícone</label>
                <select
                  className="w-full border rounded-md p-2 bg-background"
                  value={f.icon_key}
                  onChange={(e) => updateFeature(idx, { icon_key: e.target.value })}
                >
                  {['fish','users','waves','award','leaf','mapPin','camera','heart','factory','star'].map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>
            </SortableItem>
          ))}
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} className="rounded-full px-6" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  )
}


