"use client"

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

export function NewsLikeButton({ id, initialLikes = 0 }: { id: string; initialLikes?: number }) {
  const [likes, setLikes] = useState<number>(initialLikes)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    setLikes(initialLikes)
  }, [initialLikes])

  useEffect(() => {
    const onSync = (e: any) => {
      if (e?.detail?.id === id && typeof e.detail.likes === 'number') {
        setLikes(e.detail.likes)
      }
    }
    window.addEventListener('news-like-updated', onSync as any)
    return () => window.removeEventListener('news-like-updated', onSync as any)
  }, [id])
  const onLike = async () => {
    if (liked) return
    setLiked(true)
    setLikes((v) => {
      const next = v + 1
      // Broadcast update so other instances sync
      try {
        window.dispatchEvent(new CustomEvent('news-like-updated', { detail: { id, likes: next } }))
      } catch {}
      return next
    })
    try {
      await fetch('/api/public/news/like', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    } catch {}
  }
  return (
    <button onClick={onLike} className={`flex items-center space-x-1 text-sm ${liked ? 'text-rose-600' : 'text-muted-foreground'}`}>
      <Heart className={`h-4 w-4 ${liked ? 'fill-rose-500 text-rose-600' : ''}`} />
      <span>{likes}</span>
    </button>
  )
}


