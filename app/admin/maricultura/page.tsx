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
import { GripVertical, Eye, Save, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { ProjectEditor } from "@/components/admin/ProjectEditor"
import { ProjectPreview } from "@/components/admin/ProjectPreview"

type Feature = { id?: number; title: string; description: string; icon_key: string; _cid?: string }

const defaultFeatures: Feature[] = [
  { title: 'Cultivo Sustentável', description: 'Práticas que respeitam o ecossistema marinho e a qualidade dos produtos.', icon_key: 'fish' },
  { title: 'Espécies Cultivadas', description: 'Moluscos, peixes e algas em sistemas adequados ao litoral paulista.', icon_key: 'waves' },
  { title: 'Qualidade e Rastreabilidade', description: 'Padrões de produção e certificações que garantem a origem e a segurança.', icon_key: 'award' },
  { title: 'Geração de Emprego', description: 'A maricultura fortalece a economia costeira e as comunidades locais.', icon_key: 'users' },
]

export default function AdminMariculturaPage() {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [features, setFeatures] = useState<Feature[]>([])
  const [blocks, setBlocks] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/admin/maricultura', { cache: 'no-store' })
      const data = await res.json()
      setTitle(data?.content?.title || 'O que é Maricultura')
      setSubtitle(data?.content?.subtitle || '')
      setBlocks(data?.content?.content || [])
      const list: Feature[] = (data?.features && data.features.length > 0) ? data.features : defaultFeatures
      setFeatures(list.map((f: any) => ({ ...f, _cid: f.id ? String(f.id) : (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) })))
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
      const payload = {
        content: { title, subtitle },
        features: features.map(({ _cid, ...rest }) => rest),
        contentBlocks: blocks,
      }
      const res = await fetch('/api/admin/maricultura', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Falha ao salvar')
      toast.success('Conteúdo salvo com sucesso!')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao salvar conteúdo')
    } finally {
      setSaving(false)
    }
  }

  const iconHelp = 'Ícones: fish, users, waves, award, leaf, mapPin, camera, heart, factory, star'

  const SortableItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
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

  function EditableFeatureCard({ f, idx }: { f: Feature; idx: number }) {
    const [localTitle, setLocalTitle] = useState<string>(f.title)
    const [localDesc, setLocalDesc] = useState<string>(f.description)
    useEffect(() => {
      setLocalTitle(f.title)
      setLocalDesc(f.description)
    }, [f._cid])

    return (
      <div className="rounded-2xl ring-1 ring-black/5 p-5 bg-gradient-to-br from-card to-card/60 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Card {idx + 1}</Badge>
        </div>
        <div>
          <label className="text-sm font-medium">Título</label>
          <Input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={() => localTitle !== f.title && updateFeature(idx, { title: localTitle })}
            className="rounded-xl border-2 border-blue-200/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Descrição</label>
          <Textarea
            rows={3}
            value={localDesc}
            onChange={(e) => setLocalDesc(e.target.value)}
            onBlur={() => localDesc !== f.description && updateFeature(idx, { description: localDesc })}
            className="rounded-xl border-2 border-blue-200/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Ícone</label>
          <select
            className="w-full border-2 rounded-xl p-2.5 bg-background border-blue-200/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={f.icon_key}
            onChange={(e) => updateFeature(idx, { icon_key: e.target.value })}
          >
            {["fish", "users", "waves", "award", "leaf", "mapPin", "camera", "heart", "factory", "star"].map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 shadow-xl">
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-2">Maricultura</h1>
          <p className="text-blue-50 text-lg">Gerencie os textos da seção Maricultura na Home</p>
        </div>
      </div>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50/30 to-teal-50/30 ring-1 ring-black/5 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Cabeçalho</CardTitle>
          <CardDescription>Título e subtítulo exibidos na seção Maricultura</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border-2 border-blue-200/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="text-sm font-medium">Subtítulo</label>
            <Textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={3} className="rounded-xl border-2 border-blue-200/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50/30 to-teal-50/30 ring-1 ring-black/5 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Cards (4 itens)</CardTitle>
          <CardDescription>{iconHelp}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DndContext collisionDetection={closestCenter} onDragEnd={(e) => {
            const { active, over } = e
            if (!over || active.id === over.id) return
            const oldIndex = features.findIndex((it) => it._cid === active.id)
            const newIndex = features.findIndex((it) => it._cid === over.id)
            setFeatures((prev) => arrayMove(prev, oldIndex, newIndex))
          }}>
            <SortableContext items={features.map((f) => f._cid!)} strategy={verticalListSortingStrategy}>
              {features.map((f, idx) => (
                <SortableItem key={f._cid} id={f._cid!}>
                  <EditableFeatureCard f={f} idx={idx} />
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Conteúdo Completo (Modal Maricultura)</CardTitle>
              <CardDescription className="mt-1">
                Conteúdo rico exibido no modal &quot;Saiba mais&quot; da seção Maricultura
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ProjectEditor blocks={blocks} setBlocks={setBlocks} />
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/admin'}
          className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl px-6 py-2 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowPreview(true)}
            variant="outline"
            className="border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl px-6 py-2 transition-all duration-300"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-150 rounded-xl px-6 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </div>

      {showPreview && (
        <ProjectPreview blocks={blocks} isOpen={showPreview} onClose={() => setShowPreview(false)} />
      )}
    </div>
  )
}
