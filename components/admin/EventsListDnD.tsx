"use client"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalIcon, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import Link from 'next/link'

type EventItem = {
  id: string
  title: string
  created_at: string
  banner_url?: string | null
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

export function EventsListDnD({ items }: { items: EventItem[] }) {
  const router = useRouter()
  const initial = useMemo(() => [...items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)), [items])
  const [list, setList] = useState<EventItem[]>(initial)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState<{ type: 'delete' | 'toggle'; id: string; published?: boolean } | null>(null)

  const onDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex((i) => i.id === active.id)
    const newIndex = list.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(list, oldIndex, newIndex)
    setList(reordered)
    const updates = reordered.map((n, idx) => ({ id: n.id, display_order: idx }))
    try {
      await fetch('/api/admin/events/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updates }) })
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
    setList((prev) => prev.map((ev) => (ev.id === id ? { ...ev, published: newPublished } : ev)))
    
    try {
      const res = await fetch('/api/admin/events/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, published: newPublished }),
      })
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({} as any))
        throw new Error(error?.error || 'Falha na operação')
      }
      
      toast.success(newPublished ? 'Evento publicado' : 'Evento inativado')
      router.refresh()
    } catch (error: any) {
      console.error('Erro ao alterar status do evento:', error)
      toast.error('Não foi possível alterar o status')
      // Reverter atualização otimista em caso de erro
      setList((prev) => prev.map((ev) => (ev.id === id ? { ...ev, published: !!published } : ev)))
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
    setList((prev) => prev.filter((ev) => ev.id !== id))
    
    try {
      const res = await fetch('/api/admin/events/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({} as any))
        throw new Error(error?.error || 'Falha na operação')
      }
      
      toast.success('Evento excluído')
      router.refresh()
    } catch (error: any) {
      console.error('Erro ao excluir evento:', error)
      toast.error('Não foi possível excluir o evento')
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
      <SortableContext items={list.map((n) => n.id)} strategy={rectSortingStrategy}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((ev, idx) => (
            <SortableCard key={ev.id} id={ev.id} renderHandle={({ attributes, listeners }) => (
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
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/30 ring-1 ring-black/5">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-semibold line-clamp-2">{ev.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <CardDescription>{new Date(ev.created_at).toLocaleDateString('pt-BR')}</CardDescription>
                        <Badge variant={ev.published ? 'secondary' : 'outline'} className={`text-xs ${ev.published ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'text-slate-600'}`}>{ev.published ? 'Publicado' : 'Rascunho'}</Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">Ordem: {idx + 1}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><CalIcon className="h-4 w-4" />{new Date(ev.created_at).toLocaleDateString('pt-BR')}</div>
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/events/${ev.id}/edit`} onMouseDown={(e) => e.stopPropagation()} className="px-2 py-1 rounded-md hover:bg-blue-100 text-blue-700">Editar</Link>
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => setConfirmOpen({ type: 'toggle', id: ev.id, published: !!ev.published })}
                      disabled={busyIds.has(ev.id)}
                      className="px-2 py-1 rounded-md hover:bg-amber-100 text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {busyIds.has(ev.id) ? '...' : ev.published ? 'Inativar' : 'Publicar'}
                    </button>
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => setConfirmOpen({ type: 'delete', id: ev.id })}
                      disabled={busyIds.has(ev.id)}
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
          title="Excluir evento"
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
          title={confirmOpen.published ? 'Inativar evento' : 'Publicar evento'}
          description={confirmOpen.published ? 'O evento deixará de aparecer na Home.' : 'O evento será publicado e aparecerá na Home.'}
          confirmText={confirmOpen.published ? 'Inativar' : 'Publicar'}
          variant="warning"
        />
      )}
    </DndContext>
  )
}


