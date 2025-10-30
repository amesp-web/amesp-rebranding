"use client"

import { useMemo, useState } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Eye } from 'lucide-react'
import { NewsCardActions } from '@/components/admin/NewsCardActions'

type NewsItem = {
  id: string
  title: string
  created_at: string
  views?: number | null
  likes?: number | null
  display_order?: number | null
  published?: boolean | null
}

function SortableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

export function NewsListDnD({ items }: { items: NewsItem[] }) {
  const initial = useMemo(() => {
    return [...items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
  }, [items])

  const [list, setList] = useState<NewsItem[]>(initial)

  const onDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex((i) => i.id === active.id)
    const newIndex = list.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(list, oldIndex, newIndex)
    setList(reordered)

    // persist new order (0..n-1)
    const updates = reordered.map((n, idx) => ({ id: n.id, display_order: idx }))
    try {
      await fetch('/api/admin/news/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
    } catch {}
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={list.map((n) => n.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((n, idx) => (
            <SortableCard key={n.id} id={n.id}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/30 ring-1 ring-black/5">
                <CardHeader className="pb-3 cursor-grab">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-semibold line-clamp-2">{n.title}</CardTitle>
                      <CardDescription>{new Date(n.created_at).toLocaleDateString('pt-BR')}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">Ordem: {idx + 1}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1"><Heart className="h-4 w-4 text-rose-500" />{n.likes || 0}</div>
                    <div className="flex items-center gap-1"><Eye className="h-4 w-4 text-blue-500" />{n.views || 0}</div>
                  </div>
                  <NewsCardActions id={n.id} published={!!n.published} displayOrder={n.display_order || 0} />
                </CardContent>
              </Card>
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}


