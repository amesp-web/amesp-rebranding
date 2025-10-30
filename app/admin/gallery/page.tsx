"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Image as ImageIcon, ArrowUp, ArrowDown, Loader2, Camera, Search, RefreshCw, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Image from "next/image"
import {
  DndContext,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { FishTableLoading } from "@/components/ui/fish-loading"

export default function GalleryManagement() {
  const [gallery, setGallery] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    featured: false,
    display_order: 0,
  })
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [buttonClicked, setButtonClicked] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const supabase = createClient()

  const fetchGallery = async () => {
    try {
      setLoading(true)
      setGallery([])
      
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(7)
      const url = `/api/admin/gallery?t=${timestamp}&r=${random}&v=${Math.random()}`
      
      const response = await fetch(url, {
        cache: 'no-store',
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar galeria')
      }

      const result = await response.json()
      
      if (!result.gallery || !Array.isArray(result.gallery)) {
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .order("display_order", { ascending: true })

        if (error) throw error
        setGallery(data || [])
        return
      }
      
      setGallery([...result.gallery])
      setRefreshKey(prev => prev + 1)
    } catch (error: any) {
      const { data, error: supabaseError } = await supabase
        .from("gallery")
        .select("*")
        .order("display_order", { ascending: true })

      if (supabaseError) {
        toast.error("Erro ao carregar galeria: " + error.message)
      } else {
        setGallery(data || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGallery()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem")
      return
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 50MB")
      return
    }

    setFile(selectedFile)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file && !editingItem) {
      toast.error("Por favor, selecione uma imagem")
      return
    }

    setUploading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      let imageUrl = editingItem?.image_url || ""

      // Upload da imagem se houver arquivo novo
      if (file) {
        const formDataUpload = new FormData()
        formDataUpload.append("file", file)
        formDataUpload.append("featured", formData.featured ? "true" : "false")

        const uploadRes = await fetch("/api/admin/gallery/upload", {
          method: "POST",
          body: formDataUpload,
        })

        if (!uploadRes.ok) {
          const errData = await uploadRes.json()
          throw new Error(errData.error || "Erro ao fazer upload")
        }

        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      }

      // Garantir que exista apenas UM destaque por vez
      if (formData.featured) {
        if (editingItem?.id) {
          await supabase
            .from("gallery")
            .update({ featured: false })
            .neq("id", editingItem.id)
        } else {
          await supabase
            .from("gallery")
            .update({ featured: false })
        }
      }

      // Determinar display_order
      let displayOrder = formData.display_order
      if (!editingItem) {
        const featuredCount = gallery.filter((g) => g.featured).length
        if (formData.featured) {
          displayOrder = 0
          const otherItems = gallery.filter((g) => !g.featured && g.id !== editingItem?.id)
          for (let i = 0; i < otherItems.length; i++) {
            await supabase
              .from("gallery")
              .update({ display_order: i + 1 })
              .eq("id", otherItems[i].id)
          }
        } else {
          displayOrder = Math.max(...gallery.map((g) => g.display_order || 0), 0) + 1
        }
      }

      const galleryData = {
        ...formData,
        image_url: imageUrl,
        display_order: displayOrder,
        updated_at: new Date().toISOString(),
      }

      if (editingItem) {
        const { error } = await supabase.from("gallery").update(galleryData).eq("id", editingItem.id)
        if (error) throw error
        toast.success("Imagem atualizada com sucesso!")
      } else {
        const { error } = await supabase.from("gallery").insert(galleryData)
        if (error) throw error
        toast.success("Imagem adicionada com sucesso!")
      }

      setIsDialogOpen(false)
      resetForm()
      
      // Atualização otimizada
      setTimeout(() => {
        fetchGallery()
      }, 300)
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      featured: false,
      display_order: 0,
    })
    setFile(null)
    setPreview(null)
    setEditingItem(null)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      featured: item.featured || false,
      display_order: item.display_order || 0,
    })
    setPreview(item.image_url)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      // Remover imediatamente do estado
      setGallery(prev => prev.filter(item => item.id !== id))
      setRefreshKey(prev => prev + 1)
      
      const { error } = await supabase.from("gallery").delete().eq("id", id)
      if (error) throw error
      
      toast.success("Imagem removida com sucesso!")
      
      // Atualizar lista após um delay
      setTimeout(() => {
        fetchGallery()
      }, 300)
    } catch (error: any) {
      toast.error("Erro ao remover: " + error.message)
      fetchGallery() // Restaurar lista em caso de erro
    }
  }

  const moveItem = async (id: string, direction: "up" | "down") => {
    try {
      const currentIndex = gallery.findIndex((g) => g.id === id)
      if (currentIndex === -1) return

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
      if (targetIndex < 0 || targetIndex >= gallery.length) return

      const current = gallery[currentIndex]
      const target = gallery[targetIndex]

      // Atualizar estado imediatamente
      const newGallery = [...gallery]
      newGallery[currentIndex] = { ...target, display_order: current.display_order }
      newGallery[targetIndex] = { ...current, display_order: target.display_order }
      setGallery(newGallery)
      setRefreshKey(prev => prev + 1)

      await supabase.from("gallery").update({ display_order: target.display_order }).eq("id", current.id)
      await supabase.from("gallery").update({ display_order: current.display_order }).eq("id", target.id)

      setTimeout(() => {
        fetchGallery()
      }, 300)
    } catch (error: any) {
      toast.error("Erro ao reordenar: " + error.message)
      fetchGallery()
    }
  }

  const filteredGallery = gallery.filter((item) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      item.title?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.category?.toLowerCase().includes(searchLower)
    )
  })

  const featuredCount = gallery.filter((g) => g.featured).length

  // Componente item sortável
  function SortableCard({ item, index, children }: { item: any; index: number; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.6 : 1,
      cursor: "grab",
    } as React.CSSProperties

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
      </div>
    )
  }

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = gallery.findIndex((g) => g.id === active.id)
    const newIndex = gallery.findIndex((g) => g.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    // Atualiza estado imediatamente
    const moved = arrayMove(gallery, oldIndex, newIndex)
    // Reindexar SOMENTE não-destaques em sequência (1,2,3...) – armazenamos como 0,1,2...
    const nonFeatured = moved.filter((g) => !g.featured)
    const reordered = moved.map((g) =>
      g.featured ? g : { ...g, display_order: nonFeatured.findIndex((n) => n.id === g.id) }
    )
    setGallery(reordered)
    setRefreshKey((prev) => prev + 1)

    // Persiste novos índices
    try {
      const updates = [] as Promise<any>[]
      for (const item of reordered) {
        if (!item.featured) {
          updates.push(
            supabase.from("gallery").update({ display_order: item.display_order }).eq("id", item.id)
          )
        }
      }
      await Promise.all(updates)
    } catch (e: any) {
      toast.error("Erro ao salvar nova ordem: " + e.message)
      fetchGallery()
    }
  }

  return (
    <div className="space-y-8">
      {/* Header com gradiente oceânico */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 shadow-xl">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
        </div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Camera className="h-8 w-8 mr-3" />
                Galeria de Imagens
              </h1>
              <p className="text-blue-100 text-lg">Gerencie as imagens da galeria visual do site</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right text-white">
                <div className="text-2xl font-bold">{gallery.length}</div>
                <div className="text-blue-100 text-sm">Total de imagens</div>
              </div>
              <div className="text-right text-white">
                <div className="text-2xl font-bold flex items-center justify-end">
                  <Star className="h-5 w-5 mr-1" />
                  {featuredCount}
                </div>
                <div className="text-blue-100 text-sm">Em destaque</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar por título, descrição ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 border-blue-200/50 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={fetchGallery}
            className="border-2 border-blue-200/50 hover:border-blue-400 rounded-xl px-4 py-2 transition-all duration-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button
                onClick={() => resetForm()}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl font-semibold"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nova Imagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20">
              <DialogHeader className="bg-gradient-to-r from-blue-50 via-cyan-50/50 to-teal-50/30 -m-6 mb-6 p-6 rounded-t-lg border-b border-blue-200/50">
                <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                  <Camera className="h-6 w-6 mr-3 text-blue-600" />
                  {editingItem ? "Editar Imagem" : "Nova Imagem"}
                </DialogTitle>
                <DialogDescription className="text-slate-600 mt-2">
                  {editingItem ? "Atualize os dados da imagem" : "Adicione uma nova imagem à galeria"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label>Imagem *</Label>
                  {preview && (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-blue-200/50 mb-2">
                      <Image src={preview} alt="Preview" fill className="object-contain" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    required={!editingItem}
                    className="border-2 border-blue-200/50 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                  />
                  <p className="text-xs text-muted-foreground">
                    A imagem será redimensionada automaticamente para o tamanho ideal (até 50MB)
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Título *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Cultivo Sustentável"
                    required
                    className="border-2 border-blue-200/50 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição da imagem"
                    rows={3}
                    className="border-2 border-blue-200/50 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Categoria</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Produção, Tecnologia"
                    className="border-2 border-blue-200/50 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                  />
                </div>

                <div className="flex items-center space-x-3 p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured" className="cursor-pointer text-sm font-semibold text-slate-700 flex items-center">
                    <Star className="h-4 w-4 mr-2 text-amber-500" />
                    Imagem em destaque (aparece maior na home)
                  </Label>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-blue-200/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-2 border-gray-300 hover:border-gray-400 rounded-xl px-6 py-2 transition-all duration-300"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading}
                    onClick={() => {
                      setButtonClicked(true)
                      setTimeout(() => setButtonClicked(false), 200)
                    }}
                    className={`bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-150 rounded-xl px-6 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                      buttonClicked
                        ? 'scale-[0.95] brightness-110 shadow-sm'
                        : ''
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {file ? "Enviando..." : "Salvando..."}
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Grid de Imagens */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/20 to-cyan-50/10">
        <CardHeader className="bg-gradient-to-r from-blue-50/80 via-cyan-50/50 to-teal-50/30 border-b border-blue-200/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">Galeria de Imagens</CardTitle>
              <CardDescription className="text-slate-600">
                {searchTerm ? `Mostrando ${filteredGallery.length} de ${gallery.length} imagens` : `Total: ${gallery.length} imagens`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <FishTableLoading />
              <p className="text-muted-foreground mt-4">Carregando galeria...</p>
            </div>
          ) : filteredGallery.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhuma imagem encontrada" : "Nenhuma imagem na galeria ainda"}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar primeira imagem
                </Button>
              )}
            </div>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={filteredGallery.map((i) => i.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" key={refreshKey}>
                  {filteredGallery.map((item, index) => {
                const originalIndex = gallery.findIndex((g) => g.id === item.id)
                return (
                  <SortableCard key={item.id} item={item} index={index}>
                  <Card
                    key={item.id}
                    className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 border-blue-100/50 hover:border-blue-300 bg-white"
                  >
                    <div className="relative aspect-video bg-muted">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {item.featured && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                            <Star className="h-3 w-3 mr-1" />
                            Destaque
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      {/* Badge de ordem sequencial para não-destaque */}
                      {(() => {
                        if (item.featured) return null
                        const nonFeaturedSorted = [...gallery.filter((g) => !g.featured)].sort(
                          (a, b) => (a.display_order || 0) - (b.display_order || 0)
                        )
                        const position = nonFeaturedSorted.findIndex((g) => g.id === item.id)
                        return (
                          <Badge variant="outline" className="mb-2 text-xs">
                            Ordem: {position + 1}
                          </Badge>
                        )
                      })()}
                      <h3 className="font-semibold mb-1 line-clamp-1 text-slate-800">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                      )}
                      {item.category && (
                        <Badge variant="outline" className="mb-3 text-xs">
                          {item.category}
                        </Badge>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(item.id, "up")}
                            disabled={originalIndex === 0}
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                            title="Mover para cima"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(item.id, "down")}
                            disabled={originalIndex === gallery.length - 1}
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                            title="Mover para baixo"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <ConfirmationDialog
                            title="Remover Imagem"
                            description={`Tem certeza que deseja remover "${item.title}"?`}
                            onConfirm={() => handleDelete(item.id)}
                            variant="destructive"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-100"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </ConfirmationDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </SortableCard>
                )
              })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
