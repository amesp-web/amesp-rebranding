"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, GripVertical, FileText, Download as DownloadIcon } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
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

function SortableDownloadCard({ download, onDelete }: { download: Download; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: download.id })
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

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
      <Card ref={setNodeRef} style={style} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-start gap-4">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none p-2 hover:bg-slate-100 rounded-lg transition-colors mt-1"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>

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

        <CardContent className="relative z-10 pt-0">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/downloads/${download.id}/edit`)}
              className="flex-1 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
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
  const [downloads, setDownloads] = useState<Download[]>(initialDownloads)
  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = downloads.findIndex((d) => d.id === active.id)
    const newIndex = downloads.findIndex((d) => d.id === over.id)

    const newDownloads = arrayMove(downloads, oldIndex, newIndex)
    const reorderedDownloads = newDownloads.map((d, index) => ({
      ...d,
      display_order: index
    }))

    setDownloads(reorderedDownloads)

    try {
      const res = await fetch('/api/admin/downloads/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: reorderedDownloads.map(d => ({ id: d.id, display_order: d.display_order }))
        })
      })

      if (!res.ok) throw new Error('Erro ao reordenar')

      toast.success('Ordem atualizada!')
      router.refresh()
    } catch (error) {
      console.error('Erro ao reordenar:', error)
      toast.error('Erro ao atualizar ordem')
      setDownloads(initialDownloads)
    }
  }

  const handleDelete = (id: string) => {
    setDownloads(downloads.filter(d => d.id !== id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={downloads.map(d => d.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {downloads.map((download) => (
            <SortableDownloadCard key={download.id} download={download} onDelete={handleDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

