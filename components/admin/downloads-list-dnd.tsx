"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, GripVertical, FileText, Download as DownloadIcon } from "lucide-react"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

type Download = {
  id: string
  title: string
  description?: string
  file_url: string
  file_name: string
  file_size?: number
  display_order: number
  created_at: string
}

function SortableCard({ id, children, renderHandle }: { id: string; children: React.ReactNode; renderHandle: (args: any) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  }
  return (
    <div ref={setNodeRef} style={style}>
      {renderHandle({ attributes, listeners })}
      {children}
    </div>
  )
}

function DownloadCard({ download, onDelete }: { download: Download; onDelete: (id: string) => void }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch('/api/admin/downloads/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: download.id })
      })

      if (!res.ok) throw new Error('Erro ao deletar')

      toast.success('Manual deletado com sucesso!')
      onDelete(download.id)
      router.refresh()
    } catch (error) {
      console.error('Erro ao deletar:', error)
      toast.error('Erro ao deletar manual')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  return (
    <>
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/30 ring-1 ring-black/5">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">

            {/* Ícone do arquivo */}
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">{download.title}</h3>
                  {download.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{download.description}</p>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-700 border-indigo-200 flex-shrink-0">
                  Ordem: {download.display_order}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <DownloadIcon className="h-3 w-3" />
                  {download.file_name}
                </span>
                <span>{formatFileSize(download.file_size)}</span>
                <span>{new Date(download.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => router.push(`/admin/downloads/${download.id}/edit`)}
              className="flex-1 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Deletar Manual"
        description={`Tem certeza que deseja deletar "${download.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  )
}

export function DownloadsListDnD({ initialDownloads }: { initialDownloads: Download[] }) {
  const initial = useMemo(() => {
    return [...initialDownloads].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
  }, [initialDownloads])

  const [list, setList] = useState<Download[]>(initial)

  const onDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    
    const oldIndex = list.findIndex((i) => i.id === active.id)
    const newIndex = list.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(list, oldIndex, newIndex)
    setList(reordered)

    // Persist new order (0..n-1)
    const updates = reordered.map((d, idx) => ({ id: d.id, display_order: idx }))
    try {
      await fetch('/api/admin/downloads/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updates }),
      })
      toast.success('Ordem atualizada!')
    } catch (error) {
      console.error('Erro ao reordenar:', error)
      toast.error('Erro ao atualizar ordem')
      setList(initial)
    }
  }

  const handleDelete = (id: string) => {
    setList(list.filter(d => d.id !== id))
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={list.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {list.map((download) => (
            <SortableCard key={download.id} id={download.id} renderHandle={({ attributes, listeners }) => (
              <button
                className="absolute -mt-2 -ml-2 h-7 w-7 rounded-md bg-white/90 border border-blue-200/60 shadow-sm hover:bg-white cursor-grab active:cursor-grabbing z-10"
                title="Arraste para reordenar"
                {...attributes}
                {...listeners}
                onClick={(e) => e.preventDefault()}
              >
                <GripVertical className="h-4 w-4 text-slate-600 mx-auto" />
              </button>
            )}>
              <DownloadCard download={download} onDelete={handleDelete} />
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

