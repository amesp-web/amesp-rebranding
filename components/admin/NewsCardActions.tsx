"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

type Props = { id: string; published: boolean; displayOrder?: number; onStatusChange?: (published: boolean) => void; onDelete?: () => void }

export function NewsCardActions({ id, published, displayOrder = 0, onStatusChange, onDelete }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState<false | 'delete' | 'toggle'>(false)

  const postJson = async (url: string, body: any) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const m = await res.json().catch(() => ({} as any))
      throw new Error(m?.error || 'Falha na operação')
    }
  }

  const toggle = async () => {
    if (busy) return; setBusy(true)
    try {
      await postJson('/api/admin/news/toggle', { id, published: !published })
      toast.success(published ? 'Notícia inativada' : 'Notícia publicada')
      onStatusChange?.(!published)
      // fallback
      // router.refresh()
    } catch (e) {
      console.error(e)
      toast.error('Não foi possível alterar publicação')
    } finally {
      setBusy(false)
    }
  }

  const del = async () => {
    if (busy) return; setBusy(true)
    try {
      await postJson('/api/admin/news/delete', { id })
      toast.success('Notícia excluída')
      onDelete?.()
      // router.refresh()
    } catch (e) {
      console.error(e)
      toast.error('Não foi possível excluir')
    } finally {
      setBusy(false)
    }
  }

  // Funções up/down removidas: reordenação agora é apenas via drag-and-drop

  return (
    <div className="flex items-center gap-2">
      <a href={`/admin/news/${id}/edit`} onMouseDown={(e)=>e.stopPropagation()} className="px-2 py-1 rounded-md hover:bg-blue-100 text-blue-700">Editar</a>
      <button onMouseDown={(e)=>e.stopPropagation()} onClick={() => setConfirmOpen('toggle')} disabled={busy} className="px-2 py-1 rounded-md hover:bg-amber-100 text-amber-700 disabled:opacity-50">
        {published ? 'Inativar' : 'Publicar'}
      </button>
      <button onMouseDown={(e)=>e.stopPropagation()} onClick={() => setConfirmOpen('delete')} disabled={busy} className="px-2 py-1 rounded-md hover:bg-red-100 text-red-700 disabled:opacity-50">Excluir</button>
      {/* Setinhas removidas: sistema drag-and-drop já permite reordenação */}

      {confirmOpen === 'delete' && (
        <ConfirmationDialog
          isOpen
          onClose={() => setConfirmOpen(false)}
          onConfirm={del}
          title="Excluir notícia"
          description="Esta ação é irreversível. Tem certeza que deseja excluir?"
          confirmText="Excluir"
          variant="delete"
        />
      )}

      {confirmOpen === 'toggle' && (
        <ConfirmationDialog
          isOpen
          onClose={() => setConfirmOpen(false)}
          onConfirm={toggle}
          title={published ? 'Inativar notícia' : 'Publicar notícia'}
          description={published ? 'A notícia deixará de aparecer na Home.' : 'A notícia será publicada e aparecerá na Home.'}
          confirmText={published ? 'Inativar' : 'Publicar'}
          variant="warning"
        />
      )}
    </div>
  )
}


