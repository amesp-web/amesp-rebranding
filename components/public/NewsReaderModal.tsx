"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Calendar, Clock, Eye, X, Share2 } from "lucide-react"
import { useEffect, useState } from "react"
import { NewsLikeButton } from "@/components/public/NewsLikeButton"
import { toast } from "sonner"

type Article = {
  id: string | number
  title: string
  content: string
  image_url?: string | null
  category?: string | null
  created_at?: string | null
  read_time?: number | null
  views?: number | null
}

export function NewsReaderModal({ article }: { article: Article }) {
  const [open, _setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const setOpen = (next: boolean) => {
    _setOpen(next)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (next) {
        url.searchParams.set('news', String(article.id))
      } else {
        url.searchParams.delete('news')
      }
      window.history.replaceState({}, '', url.toString())
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (url.searchParams.get('news') === String(article.id)) {
      _setOpen(true)
    }
  }, [article.id])

  return (
    <>
      <button
        className="p-0 h-auto font-medium text-primary hover:text-primary/80 group-hover:translate-x-1 transition-transform"
        onClick={() => setOpen(true)}
        type="button"
      >
        Ler mais
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-0 shadow-2xl max-h-[85vh] flex flex-col">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 border border-slate-200 shadow hover:bg-white"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-slate-700" />
          </button>
          {article.image_url && (
            <div className="relative h-56 w-full shrink-0">
              <Image src={article.image_url} alt={article.title} fill className="object-cover" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
              <div className="absolute bottom-3 right-3 flex items-center space-x-3">
                <div className="bg-background/95 backdrop-blur rounded-full px-3 py-1.5 shadow-lg">
                  <NewsLikeButton id={String(article.id)} initialLikes={(article as any).likes || 0} />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const url = typeof window !== 'undefined' ? `${window.location.origin}/?news=${article.id}` : ''
                      await navigator.clipboard.writeText(url)
                      toast.success('Link copiado para a área de transferência')
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1200)
                    } catch (e) {
                      toast.error('Não foi possível copiar o link')
                    }
                  }}
                  className="bg-background/95 backdrop-blur rounded-full p-2 shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors"
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
            </div>
          )}
          {/* Cabeçalho fixo */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
            <DialogTitle className="text-2xl font-bold leading-tight">{article.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                {article.created_at && (
                  <span className="flex items-center"><Calendar className="mr-1 h-3 w-3" />{new Date(article.created_at).toLocaleDateString("pt-BR")}</span>
                )}
                {article.read_time ? (
                  <span className="flex items-center"><Clock className="mr-1 h-3 w-3" />{article.read_time}min</span>
                ) : null}
                {typeof article.views === 'number' ? (
                  <span className="flex items-center"><Eye className="mr-1 h-3 w-3" />{article.views}</span>
                ) : null}
                {article.category ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{article.category}</Badge>
                ) : null}
              </div>
            </DialogDescription>
          </DialogHeader>

          {/* Conteúdo rolável */}
          <div className="px-6 py-5 flex-1 overflow-y-auto">
            <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed">
              {article.content}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


