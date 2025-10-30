"use client"

type Props = { id: string; published: boolean; displayOrder?: number }

export function NewsCardActions({ id, published, displayOrder = 0 }: Props) {
  const toggle = async () => {
    await fetch('/api/admin/news/toggle', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, published: !published })
    })
    location.reload()
  }

  const del = async () => {
    if (!confirm('Excluir esta notícia?')) return
    await fetch('/api/admin/news/delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    location.reload()
  }

  const up = async () => {
    await fetch('/api/admin/news/reorder', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: [{ id, display_order: displayOrder - 1 }] })
    })
    location.reload()
  }

  const down = async () => {
    await fetch('/api/admin/news/reorder', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: [{ id, display_order: displayOrder + 1 }] })
    })
    location.reload()
  }

  return (
    <div className="flex items-center gap-2">
      <a href={`/admin/news/${id}/edit`} className="px-2 py-1 rounded-md hover:bg-blue-100 text-blue-700">Editar</a>
      <button onClick={toggle} className="px-2 py-1 rounded-md hover:bg-amber-100 text-amber-700">
        {published ? 'Inativar' : 'Publicar'}
      </button>
      <button onClick={del} className="px-2 py-1 rounded-md hover:bg-red-100 text-red-700">Excluir</button>
      <button onClick={up} className="px-2 py-1 rounded-md hover:bg-gray-100">↑</button>
      <button onClick={down} className="px-2 py-1 rounded-md hover:bg-gray-100">↓</button>
    </div>
  )
}


