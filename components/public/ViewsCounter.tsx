"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"

export function ViewsCounter({ id, initialViews = 0, className = "" }: { id: string; initialViews?: number; className?: string }) {
  const [views, setViews] = useState<number>(initialViews || 0)

  useEffect(() => {
    const onUpdate = (e: any) => {
      if (e?.detail?.id === id && typeof e.detail.views === 'number') {
        setViews(e.detail.views)
      }
    }
    window.addEventListener('news-views-updated', onUpdate as any)
    return () => window.removeEventListener('news-views-updated', onUpdate as any)
  }, [id])

  return (
    <div className={`flex items-center ${className}`}>
      <Eye className="mr-1 h-3 w-3" />
      {views}
    </div>
  )
}


