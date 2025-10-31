"use client"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderTree, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import Link from 'next/link'

type ProjectItem = {
  id: string
  name: string
  slug: string
  submenu_label: string
  created_at: string
  published?: boolean | null
  display_order?: number | null
}

function SortableCard({ id, children, renderHandle }: { id: string; children: React.ReactNode; renderHandle: (args: any) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 0 }
  return (
    <div ref={setNodeRef} style={style}>
      {renderHandle({ attributes, listeners })}
      {children}
    </div>
  )
}

export function ProjectsListDnD({ items }: { items: ProjectItem[] }) {
  const router = useRouter()
  const initial = useMemo(() => [...items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)), [items])
  const [list, setList] = useState<ProjectItem[]>(initial)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState<{ type: 'delete' | 'toggle'; id: string; published?: boolean } | null>(null)

  const onDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex((i) => i.id === active.id)
    const newIndex = list.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(list, oldIndex, newIndex)
    setList(reordered)
    const items = reordered.map((p, idx) => ({ id: p.id, display_order: idx }))
    try {
      await fetch('/api/admin/projects/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) })
    } catch {}
  }

  const toggle = async () => {
    if (!confirmOpen || confirmOpen.type !== 'toggle') return
    const { id, published } = confirmOpen
    if (busyIds.has(id)) return
    setBusyIds((prev) => new Set(prev).add(id))
    setConfirmOpen(null)
    
    // Atualização otimista
    const newPublished = !published
    setList((prev) => prev.map((p) => (p.id === id ? { ...p, published: newPublished } : p)))
    
    try {
      const res = await fetch('/api/admin/projects/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({} as any))
        throw new Error(error?.error || 'Falha na operação')
      }
      
      toast.success(newPublished ? 'Projeto publicado' : 'Projeto inativado')
      router.refresh()
    } catch (error: any) {
      console.error('Erro ao alterar status do projeto:', error)
      toast.error('Não foi possível alterar o status')
      // Reverter atualização otimista em caso de erro
      setList((prev) => prev.map((p) => (p.id === id ? { ...p, published: !!published } : p)))
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }
  
  const del = async () => {
    if (!confirmOpen || confirmOpen.type !== 'delete') return
    const { id } = confirmOpen
    if (busyIds.has(id)) return
    setBusyIds((prev) => new Set(prev).add(id))
    setConfirmOpen(null)
    
    // Atualização otimista
    setList((prev) => prev.filter((p) => p.id !== id))
    
    try {
      const res = await fetch('/api/admin/projects/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({} as any))
        throw new Error(error?.error || 'Falha na operação')
      }
      
      toast.success('Projeto excluído')
      router.refresh()
    } catch (error: any) {
      console.error('Erro ao excluir projeto:', error)
      toast.error('Não foi possível excluir o projeto')
      // Reverter atualização otimista em caso de erro
      router.refresh()
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={list.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((project, idx) => (
            <SortableCard key={project.id} id={project.id} renderHandle={({ attributes, listeners }) => (
              <button
                className="absolute -mt-2 -ml-2 z-50 inline-flex items-center justify-center h-7 w-7 rounded-md bg-white/90 border border-blue-200/60 shadow-sm hover:bg-white cursor-grab active:cursor-grabbing"
                title="Arraste para reordenar"
                {...attributes}
                {...listeners}
                onClick={(e) => e.preventDefault()}
              >
                <GripVertical className="h-4 w-4 text-slate-600" />
              </button>
            )}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/30 ring-1 ring-black/5 relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold line-clamp-2">{project.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <CardDescription className="text-xs">{project.submenu_label}</CardDescription>
                        <Badge variant={project.published ? 'secondary' : 'outline'} className={`text-xs ${project.published ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'text-slate-600'}`}>{project.published ? 'Publicado' : 'Rascunho'}</Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">Ordem: {idx + 1}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><FolderTree className="h-4 w-4" />{new Date(project.created_at).toLocaleDateString('pt-BR')}</div>
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/projects/${project.id}/edit`} onMouseDown={(e) => e.stopPropagation()} className="px-2 py-1 rounded-md hover:bg-blue-100 text-blue-700">Editar</Link>
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => setConfirmOpen({ type: 'toggle', id: project.id, published: !!project.published })}
                      disabled={busyIds.has(project.id)}
                      className="px-2 py-1 rounded-md hover:bg-amber-100 text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {busyIds.has(project.id) ? '...' : project.published ? 'Inativar' : 'Publicar'}
                    </button>
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => setConfirmOpen({ type: 'delete', id: project.id })}
                      disabled={busyIds.has(project.id)}
                      className="px-2 py-1 rounded-md hover:bg-red-100 text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Excluir
                    </button>
                  </div>
                </CardContent>
              </Card>
            </SortableCard>
          ))}
        </div>
      </SortableContext>

      {confirmOpen?.type === 'delete' && (
        <ConfirmationDialog
          isOpen
          onClose={() => setConfirmOpen(null)}
          onConfirm={del}
          title="Excluir projeto"
          description="Esta ação é irreversível. Tem certeza que deseja excluir?"
          confirmText="Excluir"
          variant="delete"
        />
      )}

      {confirmOpen?.type === 'toggle' && confirmOpen.published !== undefined && (
        <ConfirmationDialog
          isOpen
          onClose={() => setConfirmOpen(null)}
          onConfirm={toggle}
          title={confirmOpen.published ? 'Inativar projeto' : 'Publicar projeto'}
          description={confirmOpen.published ? 'O projeto deixará de aparecer no menu.' : 'O projeto será publicado e aparecerá no menu.'}
          confirmText={confirmOpen.published ? 'Inativar' : 'Publicar'}
          variant="warning"
        />
      )}
    </DndContext>
  )
}

