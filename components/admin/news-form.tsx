"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { ArrowLeft, Save, ImagePlus, Sparkles } from "lucide-react"
import Link from "next/link"
import { AIAssistantModal } from "./AIAssistantModal"

interface NewsFormProps {
  initialData?: any
}

export function NewsForm({ initialData }: NewsFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    category: initialData?.category || "",
    image_url: initialData?.image_url || "",
    read_time: initialData?.read_time || 5,
    published: initialData?.published || false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url || null)
  const [aiModalOpen, setAIModalOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const triggerFileSelect = () => fileInputRef.current?.click()

  const handleAISuggestion = (suggestion: { title: string; content: string; excerpt: string }) => {
    setFormData((prev) => ({
      ...prev,
      title: suggestion.title,
      content: suggestion.content,
      excerpt: suggestion.excerpt,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

    const { title, excerpt, content, category, image_url, read_time, published } = formData
    const newsData = {
      title,
      excerpt,
      content,
      category,
      image_url,
      read_time,
      published,
      author_id: user.id,
      updated_at: new Date().toISOString(),
    }

      let result
      if (initialData?.id) {
        // Update existing article
        result = await supabase.from("news").update(newsData).eq("id", initialData.id)
      } else {
        // Create new article
        result = await supabase.from("news").insert([newsData])
      }

      if (result.error) throw result.error

      router.push("/admin/news")
      router.refresh()
    } catch (error) {
      console.error("Error saving article:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setIsUploading(true)
      // Preview imediato no cliente
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Upload para Supabase Storage (bucket "news")
      const safeName = file.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9_.-]/g, '-')
      const path = `news/${Date.now()}-${safeName}`
      const { error: upErr } = await supabase.storage
        .from('news')
        .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' })
      if (upErr) throw upErr

      const { data } = supabase.storage.from('news').getPublicUrl(path)
      const publicUrl = data.publicUrl
      setFormData((prev) => ({ ...prev, image_url: publicUrl }))
      setPreviewUrl(publicUrl)
    } catch (err) {
      console.error('Erro ao enviar imagem:', err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Botões movidos para o rodapé do formulário */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">Título *</Label>
              <Button
                type="button"
                onClick={() => setAIModalOpen(true)}
                variant="outline"
                className="inline-flex items-center gap-2 border-2 border-purple-300 hover:border-purple-400 text-purple-700 hover:text-purple-800 hover:bg-purple-50 rounded-xl px-4 py-2 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                Assistente Criativo IA
              </Button>
            </div>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Digite o título da notícia"
              className="border-2 border-blue-200/60 bg-white/90 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="image_file">Foto da Notícia</Label>
              <button
                type="button"
                onClick={triggerFileSelect}
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow transition-colors"
                title="Escolher arquivo"
              >
                <ImagePlus className="h-5 w-5" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              id="image_file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
            {(previewUrl || formData.image_url) && (
              <div className="mt-2 mx-auto w-full max-w-md cursor-pointer" onClick={triggerFileSelect}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-black/5 shadow-md bg-white">
                  <img
                    src={(previewUrl || formData.image_url) || "/placeholder.svg"}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Overlay com título, estilo semelhante à gallery */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-semibold drop-shadow-sm line-clamp-1">
                        {formData.title || ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!previewUrl && !formData.image_url && (
              <div
                onClick={triggerFileSelect}
                className="mt-2 mx-auto w-full max-w-md cursor-pointer"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-dashed ring-blue-300/70 bg-white/70 flex items-center justify-center">
                  <div className="flex flex-col items-center text-slate-500">
                    <ImagePlus className="h-8 w-8 mb-2" />
                    <span className="text-sm">Clique para escolher uma imagem</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL da Imagem (opcional)</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => handleChange("image_url", e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="border-2 border-blue-200/60 bg-slate-50 text-slate-600 rounded-xl select-text"
              readOnly
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Resumo *</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => handleChange("excerpt", e.target.value)}
              placeholder="Breve descrição da notícia"
              rows={3}
              className="border-2 border-blue-200/60 bg-white/90 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              placeholder="Conteúdo completo da notícia"
              rows={15}
              className="border-2 border-blue-200/60 bg-white/90 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger className="border-2 border-blue-200/60 bg-white/90 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inovação">Inovação</SelectItem>
                <SelectItem value="Eventos">Eventos</SelectItem>
                <SelectItem value="Certificação">Certificação</SelectItem>
                <SelectItem value="Sustentabilidade">Sustentabilidade</SelectItem>
                <SelectItem value="Pesquisa">Pesquisa</SelectItem>
                <SelectItem value="Mercado">Mercado</SelectItem>
                <SelectItem value="Tecnologia">Tecnologia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="read_time">Tempo de Leitura (minutos)</Label>
            <Input
              id="read_time"
              type="number"
              value={formData.read_time}
              onChange={(e) => handleChange("read_time", Number.parseInt(e.target.value) || 5)}
              min="1"
              max="60"
              className="w-40 border-2 border-blue-200/60 bg-white/90 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => handleChange("published", checked)}
            />
            <Label htmlFor="published">Publicar imediatamente</Label>
          </div>
          
          
        </div>
      </div>

      {/* Rodapé com ações */}
      <div className="mt-8 pt-6 border-t border-blue-200/50 flex items-center justify-between">
        <Button variant="outline" asChild className="border-2 border-gray-300 hover:border-gray-400 rounded-xl px-6 py-2 transition-all duration-300">
          <Link href="/admin/news">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-150 rounded-xl px-6 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Modal do Assistente Criativo IA */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAIModalOpen(false)}
        onApply={handleAISuggestion}
      />
    </form>
  )
}
