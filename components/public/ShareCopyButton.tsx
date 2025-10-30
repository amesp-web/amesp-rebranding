"use client"

import { useState } from "react"
import { Share2 } from "lucide-react"
import { toast } from "sonner"

export function ShareCopyButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)

  const onShare = async () => {
    try {
      const url = typeof window !== 'undefined' ? `${window.location.origin}/?news=${id}` : ''
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado para a área de transferência')
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      toast.error('Não foi possível copiar o link')
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onShare}
        className="bg-background/95 backdrop-blur-md rounded-full p-2 shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors"
        aria-label="Compartilhar"
      >
        <Share2 className="h-4 w-4" />
      </button>
      {copied && (
        <div className="absolute -top-9 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded-md shadow">
          Copiado!
        </div>
      )}
    </div>
  )
}


