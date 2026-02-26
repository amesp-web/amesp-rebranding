"use client"

import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

/** Para uso no modal: imagens do Supabase em tamanho menor = carregamento mais rápido */
function getResizedImageUrl(originalUrl: string, width: number = 900): string {
  if (typeof window === "undefined") return originalUrl
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || !originalUrl?.startsWith(supabaseUrl)) return originalUrl
  const params = new URLSearchParams({ url: originalUrl, w: String(width), q: "75" })
  return `/api/image?${params.toString()}`
}

/** Retorna a URL da primeira imagem dos blocos para preload e prioridade */
function getFirstImageUrl(blocks: { type: string; data?: any }[]): string | null {
  for (const block of blocks) {
    if (block.type === "banner" && block.data?.image_url) return block.data.image_url
    if (block.type === "photo" && block.data?.url) return block.data.url
    if (block.type === "gallery" && block.data?.images?.length) return block.data.images[0]
    if (block.type === "team" && block.data?.members?.length) {
      const first = block.data.members.find((m: any) => m.avatar_url)
      if (first) return first.avatar_url
    }
    if (block.type === "logo" && block.data?.logos?.length) return block.data.logos[0]?.url ?? null
    if (block.type === "foto redimensionada" && block.data?.url) return block.data.url
  }
  return null
}

/** Imagem com skeleton; prioridade = carrega já; senão só carrega quando entrar na viewport (evita 27 requests de uma vez) */
function ModalImage({
  src,
  alt,
  className,
  style,
  wrapperClassName,
  priority = false,
}: {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  wrapperClassName?: string
  priority?: boolean
}) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(priority)
  const wrapperRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (priority) return
    const el = wrapperRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true)
      },
      { rootMargin: "200px", threshold: 0.01 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [priority])

  const showImage = inView
  return (
    <span
      ref={wrapperRef}
      className={["relative block", wrapperClassName].filter(Boolean).join(" ")}
    >
      {!loaded && (
        <span
          className="absolute inset-0 rounded-xl bg-slate-200 animate-pulse"
          aria-hidden
        />
      )}
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className={className}
          style={{ ...style, opacity: loaded ? 1 : 0, transition: "opacity 0.25s ease-in" }}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : undefined}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <span className={className} style={{ display: "block", background: "var(--tw-color-slate-200)" }} aria-hidden />
      )}
    </span>
  )
}

type Block = {
  id: string
  type: string
  data: any
}

type AboutReaderModalProps = {
  isOpen: boolean
  onClose: () => void
  blocks: Block[]
  title: string
}

export function AboutReaderModal({ isOpen, onClose, blocks, title }: AboutReaderModalProps) {
  const [mounted, setMounted] = useState(false)
  const firstImageUrl = getFirstImageUrl(blocks)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Preload da primeira imagem (versão redimensionada) para carregar mais rápido
  const firstImageUrlResized = firstImageUrl ? getResizedImageUrl(firstImageUrl, 1200) : null
  useEffect(() => {
    if (!isOpen || !firstImageUrlResized || !firstImageUrlResized.startsWith("/")) return
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = firstImageUrlResized
    document.head.appendChild(link)
    return () => {
      link.remove()
    }
  }, [isOpen, firstImageUrlResized])

  if (!mounted || !isOpen) return null

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'small': return { width: 'w-32', height: 'h-32' }
      case 'medium': return { width: 'w-48', height: 'h-48' }
      case 'large': return { width: 'w-64', height: 'h-64' }
      default: return { width: 'w-48', height: 'h-48' }
    }
  }

  const content = (
    <div className="fixed inset-0 z-[100000] overflow-hidden" style={{ zIndex: 100000 }}>
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ zIndex: 100001 }}
      />
      
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-2 md:p-4" style={{ zIndex: 100002 }}>
        <div className="relative w-full max-w-[95vw] md:max-w-[98vw] h-[95vh] md:h-[98vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 flex-shrink-0">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Conteúdo Scrollável */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
            {blocks.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Conteúdo em construção</h3>
                <p className="text-slate-600">
                  Estamos preparando conteúdo exclusivo sobre a AMESP.<br />
                  Em breve você encontrará informações detalhadas aqui!
                </p>
              </div>
            ) : (
              blocks.map((block) => {
              switch (block.type) {
                case 'banner':
                  if (!block.data?.image_url) return null
                  const bannerHeightClass = {
                    hero: 'max-h-[600px]',
                    panoramic: 'max-h-[500px]',
                    wide: 'max-h-[400px]',
                    standard: 'max-h-[400px]'
                  }[block.data?.size || 'panoramic'] || 'max-h-[500px]'
                  
                  return (
                    <div key={block.id} className="w-full flex justify-center bg-slate-50">
                      <ModalImage
                        src={getResizedImageUrl(block.data.image_url, 1200)}
                        alt="Banner"
                        className={`h-auto ${bannerHeightClass} object-contain rounded-2xl shadow-lg w-full`}
                        priority={block.data.image_url === firstImageUrl}
                      />
                    </div>
                  )

                case 'title':
                  return (
                    <h1 key={block.id} className="text-4xl font-bold text-slate-900 text-center">
                      {block.data.text}
                    </h1>
                  )

                case 'photo':
                  return (
                    <div key={block.id} className="flex justify-center">
                      {block.data.url && (
                        <ModalImage
                          src={getResizedImageUrl(block.data.url, 900)}
                          alt="Foto"
                          className="w-full h-auto max-h-[600px] object-contain rounded-2xl shadow-lg"
                          priority={block.data.url === firstImageUrl}
                        />
                      )}
                    </div>
                  )

                case 'description':
                  if (!block.data?.text) return null
                  return (
                    <div
                      key={block.id}
                      className="prose prose-lg max-w-none text-slate-700 [&_p]:mb-4 [&_p]:first:mt-0 [&_p]:last:mb-0 [&_div]:mb-4 [&_div]:last:mb-0 [&_p_strong]:font-bold [&_p_em]:italic"
                      style={{ whiteSpace: 'pre-wrap' }}
                      dangerouslySetInnerHTML={{ __html: block.data.text }}
                    />
                  )

                case 'gallery':
                  if (!block.data.images || block.data.images.length === 0) return null

                  if (block.data.layout === 'carousel') {
                    return (
                      <div key={block.id} className="w-full">
                        <Carousel>
                          <CarouselContent>
                            {block.data.images.map((img: string, idx: number) => (
                              <CarouselItem key={idx}>
                                <ModalImage src={getResizedImageUrl(img, 800)} alt={`Galeria ${idx + 1}`} className="w-full h-96 object-cover rounded-2xl" priority={img === firstImageUrl} />
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                        </Carousel>
                      </div>
                    )
                  }

                  if (block.data.layout === 'block4') {
                    const groups = []
                    for (let i = 0; i < block.data.images.length; i += 4) {
                      groups.push(block.data.images.slice(i, i + 4))
                    }
                    return (
                      <div key={block.id} className="space-y-4">
                        {groups.map((group, gIdx) => (
                          <div key={gIdx} className="grid grid-cols-2 gap-4">
                            {group.map((img: string, idx: number) => (
                              <ModalImage key={idx} src={getResizedImageUrl(img, 800)} alt={`Imagem ${idx + 1}`} className="w-full h-64 object-cover rounded-xl" priority={img === firstImageUrl} />
                            ))}
                          </div>
                        ))}
                      </div>
                    )
                  }

                  return (
                    <div key={block.id} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {block.data.images.map((img: string, idx: number) => (
                        <ModalImage key={idx} src={getResizedImageUrl(img, 800)} alt={`Galeria ${idx + 1}`} className="w-full h-48 object-cover rounded-xl shadow-md hover:shadow-xl transition-shadow" priority={img === firstImageUrl} />
                      ))}
                    </div>
                  )

                case 'team':
                  if (!block.data.members || block.data.members.length === 0) return null
                  return (
                    <div key={block.id} className="w-full">
                      <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Nossa Equipe</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {block.data.members.map((member: any, idx: number) => (
                        <div key={idx} className="text-center">
                          {member.avatar_url && (
                            <div className="relative w-32 h-32 mx-auto mb-3 rounded-full overflow-hidden shadow-lg">
                              <ModalImage src={getResizedImageUrl(member.avatar_url, 256)} alt={member.name} className="w-full h-full object-cover" priority={member.avatar_url === firstImageUrl} />
                            </div>
                          )}
                          <h3 className="font-semibold text-lg text-slate-900">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      ))}
                      </div>
                    </div>
                  )

                case 'logo':
                  if (!block.data.logos || block.data.logos.length === 0) return null
                  const sizeObj = getSizeClass(block.data.size || 'medium')
                  return (
                    <div key={block.id} className="space-y-6">
                      {block.data.sectionTitle && (
                        <h3 className="text-2xl font-bold text-center text-slate-900">{block.data.sectionTitle}</h3>
                      )}
                      <div className="flex flex-wrap justify-center items-center gap-8">
                        {block.data.logos.map((logo: any, idx: number) => (
                          <div key={idx} className="text-center">
                            <ModalImage
                              src={getResizedImageUrl(logo.url, 400)}
                              alt={logo.name || `Logo ${idx + 1}`}
                              className={`${sizeObj.width} ${sizeObj.height} object-contain`}
                              priority={logo.url === firstImageUrl}
                            />
                            {logo.name && (
                              <p className="mt-2 text-sm text-muted-foreground">{logo.name}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )

                case 'foto redimensionada':
                  if (!block.data.url) return null
                  return (
                    <div key={block.id} className="flex justify-center">
                      <div style={{ width: `${block.data.width}px`, height: `${block.data.height}px` }} className="relative">
                        <ModalImage
                          src={getResizedImageUrl(block.data.url, block.data.width ? Math.min(block.data.width, 900) : 900)}
                          alt="Foto"
                          wrapperClassName="absolute inset-0"
                          className="w-full h-full object-contain rounded-xl shadow-lg"
                          priority={block.data.url === firstImageUrl}
                        />
                      </div>
                    </div>
                  )

                case 'accordion':
                  if (!block.data?.title) return null
                  return (
                    <Accordion key={block.id} type="single" collapsible className="w-full">
                      <AccordionItem value={block.id} className="border border-slate-200 rounded-xl px-6 py-2 bg-gradient-to-r from-slate-50 to-white shadow-sm hover:shadow-md hover:border-[#023299]/30 transition-all duration-200">
                        <AccordionTrigger className="text-lg font-semibold text-slate-900 hover:text-[#023299] transition-colors py-4 hover:no-underline">
                          {block.data.title}
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-2">
                          <div
                            className="prose prose-lg max-w-none text-slate-700 [&_p]:mb-4 [&_p]:first:mt-0 [&_p]:last:mb-0"
                            dangerouslySetInnerHTML={{ __html: block.data.content || '' }}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )

                default:
                  return null
              }
            })
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

