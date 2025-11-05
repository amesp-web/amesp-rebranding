"use client"

import { X, ChevronLeft, ChevronRight, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

type Block = {
  id: string
  type: string
  data: any
}

export function ProjectPreview({ blocks, isOpen, onClose }: { blocks: Block[]; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  const renderBlock = (block: Block) => {
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
          <div key={block.id} className="w-full max-w-full relative overflow-hidden mb-8 flex justify-center bg-slate-50">
            <img
              src={block.data.image_url}
              alt="Banner"
              className={`h-auto ${bannerHeightClass} object-contain rounded-2xl shadow-lg`}
            />
          </div>
        )

      case 'title':
        if (!block.data?.title) return null
        return (
          <div key={block.id} className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">{block.data.title}</h1>
          </div>
        )

      case 'photo':
        if (!block.data?.image_url) return null
        return (
          <div key={block.id} className="max-w-4xl mx-auto px-4 py-8">
            <div className="relative w-full overflow-hidden rounded-xl">
              <img
                src={block.data.image_url}
                alt="Foto principal"
                className="w-full h-auto max-h-[600px] object-contain mx-auto"
              />
            </div>
          </div>
        )

      case 'description':
        if (!block.data?.text) return null
        return (
          <div key={block.id} className="max-w-4xl mx-auto px-4 py-8">
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-slate-700 leading-relaxed [&_p]:mb-4 [&_p]:first:mt-0 [&_p]:last:mb-0 [&_div]:mb-4 [&_div]:last:mb-0 [&_p_strong]:font-bold [&_p_em]:italic"
                style={{
                  whiteSpace: 'pre-wrap',
                }}
                dangerouslySetInnerHTML={{ __html: block.data.text }}
              />
            </div>
          </div>
        )

      case 'gallery':
        if (!block.data?.images || block.data.images.length === 0) return null
        const layout = block.data?.layout || 'grid'
        
        // Layout: Lado a lado (Grid)
        if (layout === 'grid') {
          return (
            <div key={block.id} className="max-w-6xl mx-auto px-4 py-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {block.data.images.map((img: string, idx: number) => (
                  <div key={idx} className="relative aspect-square overflow-hidden rounded-lg">
                    <img
                      src={img}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        }
        
        // Layout: Bloco 4 fotos (2x2)
        if (layout === 'block4') {
          const images = block.data.images
          return (
            <div key={block.id} className="max-w-4xl mx-auto px-4 py-8">
              <div className="grid grid-cols-2 gap-4">
                {images.slice(0, 4).map((img: string, idx: number) => (
                  <div key={idx} className="relative aspect-square overflow-hidden rounded-lg">
                    <img
                      src={img}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {images.length > 4 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {images.slice(4, 8).map((img: string, idx: number) => (
                    <div key={idx + 4} className="relative aspect-square overflow-hidden rounded-lg">
                      <img
                        src={img}
                        alt={`Foto ${idx + 5}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }
        
        // Layout: Carrossel
        if (layout === 'carousel') {
          return (
            <div key={block.id} className="max-w-4xl mx-auto px-4 py-8">
              <Carousel className="w-full">
                <CarouselContent>
                  {block.data.images.map((img: string, idx: number) => (
                    <CarouselItem key={idx}>
                      <div className="relative aspect-video overflow-hidden rounded-lg">
                        <img
                          src={img}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {block.data.images.length > 1 && (
                  <>
                    <CarouselPrevious />
                    <CarouselNext />
                  </>
                )}
              </Carousel>
            </div>
          )
        }
        
        return null

      case 'logos':
        if (!block.data?.logo_url) return null
        const logoSize = block.data?.size || { width: 200, height: 200 }
        const sizeObj = typeof logoSize === 'object' ? logoSize : { width: 200, height: 200 }
        return (
          <div key={block.id} className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-center">
              <div 
                className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-center"
                style={{ width: sizeObj.width + 32, height: sizeObj.height + 32 }}
              >
                <img
                  src={block.data.logo_url}
                  alt="Foto redimensionada"
                  className="object-contain"
                  style={{ width: sizeObj.width, height: sizeObj.height, maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
            </div>
          </div>
        )

      case 'logo':
        if (!block.data?.logos || block.data.logos.length === 0) return null
        const logoSizeFixed = block.data?.size || 'medium'
        const sectionTitle = block.data?.title || ''
        const sizeClassesFixed = {
          small: 'h-20 w-20',
          medium: 'h-32 w-32',
          large: 'h-48 w-48'
        }
        return (
          <div key={block.id} className="max-w-6xl mx-auto px-4 py-8">
            {sectionTitle && (
              <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">{sectionTitle}</h2>
            )}
            <div className="flex flex-wrap justify-center gap-8">
              {block.data.logos.map((logo: any, idx: number) => {
                const logoUrl = typeof logo === 'string' ? logo : logo.logo_url
                const logoName = typeof logo === 'object' ? logo.name : ''
                return (
                  <div key={idx} className="flex flex-col items-center gap-3">
                    <div
                      className={`${sizeClassesFixed[logoSizeFixed as keyof typeof sizeClassesFixed] || sizeClassesFixed.medium} p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-center`}
                    >
                      <img
                        src={logoUrl}
                        alt={logoName || `Logo ${idx + 1}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    {logoName && (
                      <p className="text-sm font-medium text-slate-700 text-center">{logoName}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'team':
        if (!block.data?.members || block.data.members.length === 0) return null
        return (
          <div key={block.id} className="max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Nossa Equipe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {block.data.members.map((member: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  {member.avatar_url && (
                    <div className="relative mb-4">
                      <img
                        src={member.avatar_url}
                        alt={member.name || `Membro ${idx + 1}`}
                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{member.name || 'Nome não informado'}</h3>
                  {member.role && (
                    <p className="text-sm text-slate-600">{member.role}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      case 'accordion':
        if (!block.data?.title) return null
        return (
          <div key={block.id} className="max-w-4xl mx-auto px-4 py-4">
            <Accordion type="single" collapsible className="w-full">
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
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-2 md:p-4">
        <div className="relative w-full max-w-[95vw] md:max-w-[98vw] h-[95vh] md:h-[98vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <h2 className="text-xl font-bold text-slate-900">Preview do Projeto</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto bg-slate-50">
            {blocks.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">Nenhum bloco adicionado ainda</p>
              </div>
            ) : (
              <div className="min-h-full">
                {blocks.map((block) => renderBlock(block))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex justify-end">
              <Button onClick={onClose} variant="outline">
                Fechar Preview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

