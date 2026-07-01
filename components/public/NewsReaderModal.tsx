"use client"

import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Eye, X, Share2 } from "lucide-react"
import { NewsLikeButton } from "@/components/public/NewsLikeButton"
import { toast } from "sonner"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

type Article = {
  id: string | number
  title: string
  content: string
  image_url?: string | null
  images?: string[] | null
  category?: string | null
  created_at?: string | null
  read_time?: number | null
  views?: number | null
}

function preloadImages(urls: string[]) {
  urls.forEach((url) => {
    if (!url?.trim()) return
    const img = new Image()
    img.src = url
  })
}

function ModalHeroImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className="relative flex w-full items-center justify-center"
      style={{ minHeight: loaded ? undefined : "12rem" }}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-slate-200" aria-hidden />
      )}
      <img
        src={src}
        alt={alt}
        className="mx-auto block h-auto w-full object-contain"
        style={{
          maxHeight: "min(50dvh, 420px)",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.2s ease-in",
        }}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

export function NewsReaderModal({ article }: { article: Article }) {
  const [open, _setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentViews, setCurrentViews] = useState<number>(article.views || 0)

  const images = useMemo(() => {
    const extra = (article as { images?: string[] | null }).images
    if (Array.isArray(extra) && extra.length > 0) {
      return extra.filter((src) => typeof src === "string" && src.trim().length > 0)
    }
    return article.image_url ? [article.image_url] : []
  }, [article.image_url, article.images])

  const setOpen = (next: boolean) => {
    _setOpen(next)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (next) {
        url.searchParams.set("news", String(article.id))
      } else {
        url.searchParams.delete("news")
      }
      window.history.replaceState({}, "", url.toString())
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    if (url.searchParams.get("news") === String(article.id)) {
      _setOpen(true)
      preloadImages(images)
    }
  }, [article.id, images])

  useEffect(() => {
    if (!open) return
    preloadImages(images)
  }, [open, images])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    const key = `news:viewed:${article.id}`
    if (!open) return
    try {
      const already = localStorage.getItem(key)
      if (already) return
      fetch("/api/public/news/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: article.id }),
      })
        .then(async (r) => {
          try {
            const data = await r.json()
            if (data?.views != null) setCurrentViews(Number(data.views))
            else setCurrentViews((v) => v + 1)
          } catch {
            setCurrentViews((v) => v + 1)
          }
          localStorage.setItem(key, "1")
        })
        .catch(() => {})
    } catch {}
  }, [open, article.id])

  const renderImage = (src: string) => (
    <ModalHeroImage src={src} alt={article.title} />
  )

  const handleWarmup = () => preloadImages(images)

  const modal = open ? (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div className="relative z-10 flex w-full max-w-3xl max-h-[92dvh] flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:rounded-2xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow hover:bg-white"
          aria-label="Fechar"
        >
          <X className="h-5 w-5 text-slate-700" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain" style={{ WebkitOverflowScrolling: "touch" }}>
          {images.length > 0 && (
            <div className="relative w-full shrink-0 bg-slate-100">
              {images.length > 1 ? (
                <Carousel className="w-full">
                  <CarouselContent className="ml-0">
                    {images
                      .filter((src) => typeof src === "string" && src.trim().length > 0)
                      .map((src) => (
                        <CarouselItem key={src} className="pl-0 basis-full">
                          <div className="flex w-full items-center justify-center p-2 sm:p-3">
                            {renderImage(src)}
                          </div>
                        </CarouselItem>
                      ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2 bg-background/80 hover:bg-background" />
                  <CarouselNext className="right-2 bg-background/80 hover:bg-background" />
                </Carousel>
              ) : (
                <div className="flex w-full items-center justify-center p-2 sm:p-3">
                  {renderImage(images[0])}
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <div className="rounded-full bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur">
                  <NewsLikeButton id={String(article.id)} initialLikes={(article as any).likes || 0} />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const url =
                        typeof window !== "undefined"
                          ? `${window.location.origin}/?news=${article.id}`
                          : ""
                      await navigator.clipboard.writeText(url)
                      toast.success("Link copiado para a área de transferência")
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1200)
                    } catch {
                      toast.error("Não foi possível copiar o link")
                    }
                  }}
                  className="rounded-full bg-background/95 p-2 shadow-lg backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label="Compartilhar"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                {copied && (
                  <div className="absolute -top-9 right-0 rounded-md bg-black/80 px-2 py-1 text-xs text-white shadow">
                    Copiado!
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border-b border-border/40 px-4 py-4 sm:px-6 sm:py-5">
            <h2 className="pr-10 text-xl font-bold leading-tight sm:text-2xl">{article.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground sm:gap-3">
              {article.created_at && (
                <span className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(article.created_at).toLocaleDateString("pt-BR")}
                </span>
              )}
              {article.read_time ? (
                <span className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {article.read_time}min
                </span>
              ) : null}
              <span className="flex items-center">
                <Eye className="mr-1 h-3 w-3" />
                {currentViews}
              </span>
              {article.category ? (
                <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary">
                  {article.category}
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="px-4 py-4 sm:px-6 sm:py-5">
            <div
              className="prose prose-slate max-w-none break-words leading-relaxed [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_p]:mb-4 [&_p]:last:mb-0"
              dangerouslySetInnerHTML={{ __html: article.content || "" }}
            />
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        className="group-hover:translate-x-1 h-auto p-0 font-medium text-primary transition-transform hover:text-primary/80"
        onMouseEnter={handleWarmup}
        onFocus={handleWarmup}
        onTouchStart={handleWarmup}
        onClick={() => setOpen(true)}
        type="button"
      >
        Ler mais
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  )
}
