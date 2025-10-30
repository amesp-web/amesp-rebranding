"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Image as ImageIcon, ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Image from "next/image"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

export default function GalleryManagement() {
  const [gallery, setGallery] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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

  const supabase = createClient()

  const fetchGallery = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("display_order", { ascending: true })

      if (error) throw error
      setGallery(data || [])
    } catch (error: any) {
      toast.error("Erro ao carregar galeria: " + error.message)
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
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `gallery/${fileName}`

        // Fazer upload via API que processa a imagem
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

      // Determinar display_order: featured vem primeiro, depois por ordem crescente
      let displayOrder = formData.display_order
      if (!editingItem) {
        const featuredCount = gallery.filter((g) => g.featured).length
        if (formData.featured) {
          displayOrder = 0
          // Reordenar os outros itens
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
      fetchGallery()
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
      const { error } = await supabase.from("gallery").delete().eq("id", id)
      if (error) throw error
      toast.success("Imagem removida com sucesso!")
      fetchGallery()
    } catch (error: any) {
      toast.error("Erro ao remover: " + error.message)
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

      // Trocar display_order
      await supabase.from("gallery").update({ display_order: target.display_order }).eq("id", current.id)
      await supabase.from("gallery").update({ display_order: current.display_order }).eq("id", target.id)

      fetchGallery()
    } catch (error: any) {
      toast.error("Erro ao reordenar: " + error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Galeria</h1>
          <p className="text-muted-foreground">Adicione e organize imagens da galeria visual</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Imagem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Imagem" : "Nova Imagem"}</DialogTitle>
              <DialogDescription>
                {editingItem ? "Atualize os dados da imagem" : "Adicione uma nova imagem à galeria"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Imagem *</Label>
                {preview && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border mb-2">
                    <Image src={preview} alt="Preview" fill className="object-contain" />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  required={!editingItem}
                />
                <p className="text-xs text-muted-foreground">
                  A imagem será redimensionada automaticamente para o tamanho ideal (até 50MB)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Cultivo Sustentável"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da imagem"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Produção, Tecnologia"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Imagem em destaque (aparece maior na home)
                </Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={uploading}>
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

      <Card>
        <CardHeader>
          <CardTitle>Galeria de Imagens</CardTitle>
          <CardDescription>Arraste os itens para reordenar ou clique nas ações para editar/excluir</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Carregando galeria...</p>
            </div>
          ) : gallery.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma imagem na galeria ainda</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar primeira imagem
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map((item, index) => (
                <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
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
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                        Destaque
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveItem(item.id, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveItem(item.id, "down")}
                          disabled={index === gallery.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmationDialog
                          title="Remover Imagem"
                          description={`Tem certeza que deseja remover "${item.title}"?`}
                          onConfirm={() => handleDelete(item.id)}
                          variant="destructive"
                        >
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </ConfirmationDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
