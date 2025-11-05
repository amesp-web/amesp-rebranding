"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

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
                      <img 
                        src={block.data.image_url} 
                        alt="Banner" 
                        className={`h-auto ${bannerHeightClass} object-contain rounded-2xl shadow-lg`} 
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
                        <img src={block.data.url} alt="Foto" className="w-full h-auto max-h-[600px] object-contain rounded-2xl shadow-lg" />
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
                                <img src={img} alt={`Galeria ${idx + 1}`} className="w-full h-96 object-cover rounded-2xl" />
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
                              <img key={idx} src={img} alt={`Imagem ${idx + 1}`} className="w-full h-64 object-cover rounded-xl" />
                            ))}
                          </div>
                        ))}
                      </div>
                    )
                  }

                  return (
                    <div key={block.id} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {block.data.images.map((img: string, idx: number) => (
                        <img key={idx} src={img} alt={`Galeria ${idx + 1}`} className="w-full h-48 object-cover rounded-xl shadow-md hover:shadow-xl transition-shadow" />
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
                              <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
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
                            <img
                              src={logo.url}
                              alt={logo.name || `Logo ${idx + 1}`}
                              className={`${sizeObj.width} ${sizeObj.height} object-contain`}
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
                        <img src={block.data.url} alt="Foto" className="w-full h-full object-contain rounded-xl shadow-lg" />
                      </div>
                    </div>
                  )

                case 'accordion':
                  if (!block.data?.title) return null
                  return (
                    <Accordion key={block.id} type="single" collapsible className="w-full">
                      <AccordionItem value={block.id}>
                        <AccordionTrigger className="text-lg font-semibold text-slate-900 hover:text-[#023299] transition-colors">
                          {block.data.title}
                        </AccordionTrigger>
                        <AccordionContent>
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

