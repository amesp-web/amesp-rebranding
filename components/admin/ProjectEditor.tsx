"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X, Plus, Image as ImageIcon, FileText, Camera, Images, Users, Building2, UserCircle } from "lucide-react"
import { RichTextEditor } from "@/components/admin/RichTextEditor"
import { ImageResizer } from "@/components/admin/ImageResizer"

type BlockType = 'banner' | 'title' | 'photo' | 'description' | 'gallery' | 'logos' | 'logo' | 'team'

interface Block {
  id: string
  type: BlockType
  data: any
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: any }[] = [
  { type: 'banner', label: 'Banner', icon: ImageIcon },
  { type: 'title', label: 'Título', icon: FileText },
  { type: 'photo', label: 'Foto Principal', icon: Camera },
  { type: 'description', label: 'Descrição', icon: FileText },
  { type: 'gallery', label: 'Galeria de Fotos', icon: Images },
  { type: 'logos', label: 'Foto Redimensionada', icon: ImageIcon },
  { type: 'logo', label: 'Logos', icon: Building2 },
  { type: 'team', label: 'Equipe', icon: Users },
]

function SortableBlock({ block, onUpdate, onRemove }: { block: Block; onUpdate: (data: any) => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <BlockEditor block={block} onUpdate={onUpdate} onRemove={onRemove} dragHandle={{ attributes, listeners }} />
    </div>
  )
}

function BlockEditor({ block, onUpdate, onRemove, dragHandle }: { block: Block; onUpdate: (data: any) => void; onRemove: () => void; dragHandle: any }) {
  const supabase = createClient()
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const fixedLogoInputRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    const safeName = file.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_.-]/g, '-')
    const path = `projects/${Date.now()}-${safeName}`
    const { error } = await supabase.storage.from('projects').upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' })
    if (error) throw error
    const { data } = supabase.storage.from('projects').getPublicUrl(path)
    return data.publicUrl
  }

  const renderBlock = () => {
    switch (block.type) {
      case 'banner':
        return (
          <Card className="border-2 border-dashed border-blue-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-sm font-semibold">Banner</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    {...dragHandle.attributes}
                    {...dragHandle.listeners}
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
                    onClick={(e) => e.preventDefault()}
                  >
                    <GripVertical className="h-4 w-4 text-gray-500" />
                  </button>
                  <button onClick={onRemove} className="p-1 hover:bg-red-100 rounded text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Tamanho do Banner (padrões do mercado)</Label>
                <Select 
                  value={block.data?.size || 'panoramic'} 
                  onValueChange={(val) => onUpdate({ ...block.data, size: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Hero (1920x600px)</span>
                        <span className="text-xs text-muted-foreground">Impacto visual máximo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="panoramic">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Panorâmico (1920x500px)</span>
                        <span className="text-xs text-muted-foreground">Padrão geral - Recomendado</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="wide">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Wide (1600x400px)</span>
                        <span className="text-xs text-muted-foreground">Mais compacto</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="standard">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Standard (1200x400px)</span>
                        <span className="text-xs text-muted-foreground">Econômico e leve</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {block.data?.size === 'hero' && '📐 1920x600px - Ideal para destaque principal'}
                  {block.data?.size === 'panoramic' && '📐 1920x500px - Padrão para a maioria dos banners'}
                  {block.data?.size === 'wide' && '📐 1600x400px - Compacto e carrega rápido'}
                  {block.data?.size === 'standard' && '📐 1200x400px - Leve e econômico'}
                  {!block.data?.size && '📐 1920x500px - Padrão para a maioria dos banners'}
                </p>
              </div>
              <div>
                <Label>Imagem do Banner</Label>
                <input
                  type="file"
                  accept="image/*"
                  ref={bannerInputRef}
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (f) {
                      try {
                        const url = await upload(f)
                        onUpdate({ ...block.data, image_url: url })
                      } catch {
                        toast.error('Falha ao enviar imagem')
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => bannerInputRef.current?.click()}
                  className="w-full"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {block.data?.image_url ? 'Alterar Imagem' : 'Escolher Imagem'}
                </Button>
                {block.data?.image_url && (
                  <div className="mt-2 relative">
                    <img src={block.data.image_url} className="w-full h-48 object-cover rounded-lg" alt="Banner" />
                    <Badge className="absolute top-2 right-2 bg-blue-600">
                      {block.data?.size === 'hero' && 'Hero 1920x600'}
                      {block.data?.size === 'panoramic' && 'Panorâmico 1920x500'}
                      {block.data?.size === 'wide' && 'Wide 1600x400'}
                      {block.data?.size === 'standard' && 'Standard 1200x400'}
                      {!block.data?.size && 'Panorâmico 1920x500'}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'title':
        return (
          <Card className="border-2 border-dashed border-blue-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-sm font-semibold">Título</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    {...dragHandle.attributes}
                    {...dragHandle.listeners}
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
                    onClick={(e) => e.preventDefault()}
                  >
                    <GripVertical className="h-4 w-4 text-gray-500" />
                  </button>
                  <button onClick={onRemove} className="p-1 hover:bg-red-100 rounded text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Título do Projeto</Label>
                <Input
                  value={block.data?.title || ''}
                  onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                  placeholder="Digite o título"
                />
              </div>
            </CardContent>
          </Card>
        )

      case 'photo':
        return (
          <Card className="border-2 border-dashed border-blue-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-sm font-semibold">Foto Principal</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    {...dragHandle.attributes}
                    {...dragHandle.listeners}
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
                    onClick={(e) => e.preventDefault()}
                  >
                    <GripVertical className="h-4 w-4 text-gray-500" />
                  </button>
                  <button onClick={onRemove} className="p-1 hover:bg-red-100 rounded text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Foto Principal</Label>
                <input
                  type="file"
                  accept="image/*"
                  ref={photoInputRef}
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (f) {
                      try {
                        const url = await upload(f)
                        onUpdate({ ...block.data, image_url: url })
                      } catch {
                        toast.error('Falha ao enviar imagem')
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {block.data?.image_url ? 'Alterar Foto' : 'Escolher Foto'}
                </Button>
                {block.data?.image_url && (
                  <img src={block.data.image_url} className="mt-2 w-full h-64 object-cover rounded-lg" alt="Foto principal" />
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'description':
        return (
          <Card className="border-2 border-dashed border-blue-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-sm font-semibold">Descrição</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    {...dragHandle.attributes}
                    {...dragHandle.listeners}
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
                    onClick={(e) => e.preventDefault()}
                  >
                    <GripVertical className="h-4 w-4 text-gray-500" />
                  </button>
                  <button onClick={onRemove} className="p-1 hover:bg-red-100 rounded text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Texto da Descrição</Label>
                <RichTextEditor
                  value={block.data?.text || ''}
                  onChange={(html) => onUpdate({ ...block.data, text: html })}
                  placeholder="Digite a descrição do projeto"
                />
                <p className="mt-2 text-xs text-slate-500">
                  💡 Dica: Selecione o texto e use os botões acima para aplicar negrito ou itálico
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 'gallery':
        const addGalleryImages = async (files: File[]) => {
          try {
            const uploadPromises = files.map(file => upload(file))
            const urls = await Promise.all(uploadPromises)
            onUpdate({ ...block.data, images: [...(block.data?.images || []), ...urls] })
          } catch {
            toast.error('Falha ao enviar algumas imagens')
          }
        }
        const layout = block.data?.layout || 'grid'
        return (
          <Card className="border-2 border-dashed border-blue-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Images className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-sm font-semibold">Galeria de Fotos</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    {...dragHandle.attributes}
                    {...dragHandle.listeners}
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
                    onClick={(e) => e.preventDefault()}
                  >
                    <GripVertical className="h-4 w-4 text-gray-500" />
                  </button>
                  <button onClick={onRemove} className="p-1 hover:bg-red-100 rounded text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Layout da Galeria</Label>
                  <Select
                    value={layout}
                    onValueChange={(value) => onUpdate({ ...block.data, layout: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Lado a Lado (Grid)</SelectItem>
                      <SelectItem value="block4">Bloco 4 Fotos (2x2)</SelectItem>
                      <SelectItem value="carousel">Carrossel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={galleryInputRef}
                    className="hidden"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || [])
                      if (files.length > 0) {
                        await addGalleryImages(files)
                        // Limpar o input para permitir selecionar os mesmos arquivos novamente
                        if (galleryInputRef.current) {
                          galleryInputRef.current.value = ''
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full mb-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Fotos
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    {(block.data?.images || []).map((img: string, idx: number) => (
                      <div key={idx} className="relative group">
                        <img src={img} className="w-full h-24 object-cover rounded" alt={`Foto ${idx + 1}`} />
                        <button
                          onClick={() => onUpdate({ ...block.data, images: block.data.images.filter((_: string, i: number) => i !== idx) })}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'logos':
        const logoSize = block.data?.size || { width: 200, height: 200 }
        return (
          <Card className="border-2 border-dashed border-blue-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-sm font-semibold">Foto Redimensionada</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    {...dragHandle.attributes}
                    {...dragHandle.listeners}
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
                    onClick={(e) => e.preventDefault()}
                  >
                    <GripVertical className="h-4 w-4 text-gray-500" />
                  </button>
                  <button onClick={onRemove} className="p-1 hover:bg-red-100 rounded text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Logo</Label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={logoInputRef}
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0]
                      if (f) {
                        try {
                          const url = await upload(f)
                          onUpdate({ ...block.data, logo_url: url, size: { width: 200, height: 200 } })
                        } catch {
                          toast.error('Falha ao enviar logo')
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {block.data?.logo_url ? 'Alterar Foto' : 'Escolher Foto'}
                  </Button>
                </div>
                {block.data?.logo_url && (
                  <div className="mt-4">
                    <Label>Redimensionar Logo</Label>
                    <div className="mt-2">
                      <ImageResizer
                        imageUrl={block.data.logo_url}
                        initialSize={typeof logoSize === 'object' ? logoSize : { width: 200, height: 200 }}
                        onSizeChange={(newSize) => onUpdate({ ...block.data, size: newSize })}
                        minSize={64}
                        maxSize={600}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'logo':
        const logoSizeFixed = block.data?.size || 'medium'
        const logos = block.data?.logos || []
        const sectionTitle = block.data?.title || ''
        const addLogos = async (files: File[]) => {
          try {
            const uploadPromises = files.map((file) => upload(file))
            const urls = await Promise.all(uploadPromises)
            const newLogos = urls.map((url) => ({ logo_url: url, name: '' }))
            onUpdate({ ...block.data, logos: [...logos, ...newLogos] })
          } catch (error) {
            toast.error('Falha ao enviar alguns logos')
            console.error('Erro no upload:', error)
          }
        }
        const updateLogoName = (idx: number, name: string) => {
          const newLogos = [...logos]
          newLogos[idx] = { ...newLogos[idx], name }
          onUpdate({ ...block.data, logos: newLogos })
        }
        const removeLogo = (idx: number) => {
          const newLogos = logos.filter((_: any, i: number) => i !== idx)
          onUpdate({ ...block.data, logos: newLogos })
        }
        return (
          <Card className="border-2 border-dashed border-blue-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-sm font-semibold">Logos</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    {...dragHandle.attributes}
                    {...dragHandle.listeners}
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
                    onClick={(e) => e.preventDefault()}
                  >
                    <GripVertical className="h-4 w-4 text-gray-500" />
                  </button>
                  <button onClick={onRemove} className="p-1 hover:bg-red-100 rounded text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Título da Seção</Label>
                  <Input
                    value={sectionTitle}
                    onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                    placeholder="Ex: Stand, Patrocinadores, Apoio..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Tamanho dos Logos</Label>
                  <Select
                    value={logoSizeFixed}
                    onValueChange={(value) => onUpdate({ ...block.data, size: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeno</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fixedLogoInputRef}
                    className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || [])
                      if (files.length > 0) {
                        await addLogos(files)
                      }
                      if (fixedLogoInputRef.current) {
                        fixedLogoInputRef.current.value = ''
                      }
                    }}
                    multiple
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fixedLogoInputRef.current?.click()}
                    className="w-full"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Adicionar Logo(s)
                  </Button>
                </div>
                {logos.length > 0 && (
                  <div className="space-y-3">
                    <Label>Logos Adicionados ({logos.length})</Label>
                    <div className="space-y-4">
                      {logos.map((logo: any, idx: number) => {
                        const logoUrl = typeof logo === 'string' ? logo : logo.logo_url
                        return (
                          <div key={idx} className="p-4 border border-slate-200 rounded-lg bg-white space-y-3">
                            <div className="relative group flex justify-center">
                              <div className={`
                                ${logoSizeFixed === 'small' ? 'h-20 w-20' : ''}
                                ${logoSizeFixed === 'medium' ? 'h-32 w-32' : ''}
                                ${logoSizeFixed === 'large' ? 'h-48 w-48' : ''}
                                p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-center
                              `}>
                                <img
                                  src={logoUrl}
                                  className="max-h-full max-w-full object-contain"
                                  alt={`Logo ${idx + 1}`}
                                />
                              </div>
                              <button
                                onClick={() => removeLogo(idx)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                title="Remover logo"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div>
                              <Label className="text-sm">Descrição do Logo</Label>
                              <Input
                                value={typeof logo === 'object' ? (logo.name || '') : ''}
                                onChange={(e) => updateLogoName(idx, e.target.value)}
                                placeholder="Ex: Realizador, Patrocinador, Apoio..."
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'team':
        const addTeamMember = () => {
          const members = block.data?.members || []
          onUpdate({ ...block.data, members: [...members, { avatar_url: '', name: '', role: '' }] })
        }
        const updateTeamMember = (idx: number, field: string, value: any) => {
          const members = [...(block.data?.members || [])]
          members[idx] = { ...members[idx], [field]: value }
          onUpdate({ ...block.data, members })
        }
        const removeTeamMember = (idx: number) => {
          const members = (block.data?.members || []).filter((_: any, i: number) => i !== idx)
          onUpdate({ ...block.data, members })
        }
        return (
          <Card className="border-2 border-dashed border-blue-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-sm font-semibold">Equipe</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    {...dragHandle.attributes}
                    {...dragHandle.listeners}
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
                    onClick={(e) => e.preventDefault()}
                  >
                    <GripVertical className="h-4 w-4 text-gray-500" />
                  </button>
                  <button onClick={onRemove} className="p-1 hover:bg-red-100 rounded text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTeamMember}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Membro
                </Button>
                <div className="space-y-4">
                  {(block.data?.members || []).map((member: any, idx: number) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-lg bg-white space-y-3">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <Label className="mb-1 text-xs">Avatar</Label>
                          <label className="cursor-pointer">
                            <div className="h-16 w-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
                              {member.avatar_url ? (
                                <img src={member.avatar_url} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                              ) : (
                                <UserCircle className="h-8 w-8 text-slate-400" />
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const f = e.target.files?.[0]
                                if (f) {
                                  try {
                                    const url = await upload(f)
                                    updateTeamMember(idx, 'avatar_url', url)
                                  } catch {
                                    toast.error('Falha ao enviar avatar')
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <Label>Nome</Label>
                            <Input
                              value={member.name || ''}
                              onChange={(e) => updateTeamMember(idx, 'name', e.target.value)}
                              placeholder="Nome do membro"
                            />
                          </div>
                          <div>
                            <Label>Cargo</Label>
                            <Input
                              value={member.role || ''}
                              onChange={(e) => updateTeamMember(idx, 'role', e.target.value)}
                              placeholder="Cargo/Função"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => removeTeamMember(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded self-start"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return renderBlock()
}

export function ProjectEditor({ blocks, setBlocks }: { blocks: Block[]; setBlocks: (blocks: Block[]) => void }) {
  const blocksContainerRef = useRef<HTMLDivElement>(null)

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: `${type}-${Date.now()}`,
      type,
      data: type === 'gallery' ? { images: [], layout: 'grid' } : type === 'team' ? { members: [] } : type === 'logo' ? { size: 'medium', logos: [] } : {},
    }
    setBlocks([...blocks, newBlock])
    
    // Scroll para o novo bloco após um pequeno delay
    setTimeout(() => {
      if (blocksContainerRef.current) {
        const lastBlock = blocksContainerRef.current.lastElementChild
        if (lastBlock) {
          lastBlock.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Adiciona um efeito visual de destaque
          lastBlock.classList.add('animate-pulse')
          setTimeout(() => {
            lastBlock.classList.remove('animate-pulse')
          }, 1000)
        }
      }
    }, 100)
  }

  const updateBlock = (id: string, data: any) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, data } : b)))
  }

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id))
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = blocks.findIndex((b) => b.id === active.id)
    const newIndex = blocks.findIndex((b) => b.id === over.id)
    setBlocks(arrayMove(blocks, oldIndex, newIndex))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Painel de blocos disponíveis */}
      <div className="lg:col-span-1">
        <Card className="border-0 shadow-lg overflow-hidden max-w-xs sticky top-4 max-h-[calc(100vh-3rem)]">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 pb-4">
            <CardTitle className="text-lg font-bold text-white">Blocos Disponíveis</CardTitle>
            <p className="text-sm text-white/90">Clique para adicionar ao editor</p>
          </CardHeader>
          <CardContent className="space-y-2 pt-4 pb-4 bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/20 overflow-y-auto max-h-[calc(100vh-16rem)]">
          {BLOCK_TYPES.map((bt) => {
            const Icon = bt.icon
            return (
              <button
                key={bt.type}
                type="button"
                className="w-fit px-4 py-2 border border-slate-200 rounded-md bg-white text-slate-900 font-medium flex items-center justify-start hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 transition-all"
                onClick={() => addBlock(bt.type)}
              >
                <Icon className="mr-2 h-4 w-4 text-blue-600" />
                <span>{bt.label}</span>
              </button>
            )
          })}
        </CardContent>
        </Card>
      </div>

      {/* Área de edição */}
      <div className="lg:col-span-4 space-y-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 border-b-0">
            <CardTitle className="text-xl font-bold text-white">Editor de Blocos</CardTitle>
            <p className="text-sm text-white/90">Organize seus blocos arrastando-os</p>
          </CardHeader>
          <CardContent className="pt-6">
            {blocks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">Nenhum bloco adicionado ainda</p>
                <p className="text-sm">Adicione blocos do painel lateral</p>
              </div>
            ) : (
              <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  <div ref={blocksContainerRef} className="space-y-4">
                    {blocks.map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        onUpdate={(data) => updateBlock(block.id, data)}
                        onRemove={() => removeBlock(block.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

