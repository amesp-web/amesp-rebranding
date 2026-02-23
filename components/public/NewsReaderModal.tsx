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
  const [currentViews, setCurrentViews] = useState<number>(article.views || 0)

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

  // Incremento de views quando abre, evitando duplicidade por usuário
  useEffect(() => {
    const key = `news:viewed:${article.id}`
    if (!open) return
    try {
      const already = localStorage.getItem(key)
      if (already) return
      fetch('/api/public/news/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: article.id }) })
        .then(async (r) => {
          try {
            const data = await r.json()
            if (data?.views != null) setCurrentViews(Number(data.views))
            else setCurrentViews((v) => v + 1)
            try { window.dispatchEvent(new CustomEvent('news-views-updated', { detail: { id: String(article.id), views: Number(data?.views ?? (currentViews + 1)) } })) } catch {}
          } catch {
            setCurrentViews((v) => v + 1)
            try { window.dispatchEvent(new CustomEvent('news-views-updated', { detail: { id: String(article.id), views: (currentViews || 0) + 1 } })) } catch {}
          }
          localStorage.setItem(key, '1')
        })
        .catch(() => {})
    } catch {}
  }, [open, article.id])

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
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-0 shadow-2xl max-h-[85vh]">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 border border-slate-200 shadow hover:bg-white"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-slate-700" />
          </button>
          <div className="flex flex-col max-h-[85vh] min-h-0">
            {article.image_url && (
              <div className="relative w-full h-[40vh] min-h-[200px] max-h-[360px] shrink-0 bg-muted/30">
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 48rem"
                />
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
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 shrink-0">
              <DialogTitle className="text-2xl font-bold leading-tight">{article.title}</DialogTitle>
              <DialogDescription>
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  {article.created_at && (
                    <span className="flex items-center"><Calendar className="mr-1 h-3 w-3" />{new Date(article.created_at).toLocaleDateString("pt-BR")}</span>
                  )}
                  {article.read_time ? (
                    <span className="flex items-center"><Clock className="mr-1 h-3 w-3" />{article.read_time}min</span>
                  ) : null}
                  <span className="flex items-center"><Eye className="mr-1 h-3 w-3" />{currentViews}</span>
                  {article.category ? (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{article.category}</Badge>
                  ) : null}
                </div>
              </DialogDescription>
            </DialogHeader>

            {/* Conteúdo rolável - min-h-0 é essencial para o scroll funcionar no flex */}
            <div className="px-6 py-5 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
              <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed">
                {article.content || ''}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


