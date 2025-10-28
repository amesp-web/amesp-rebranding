"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

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
  const router = useRouter()
  const supabase = createClient()

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

      const newsData = {
        ...formData,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/admin/news">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div className="flex items-center space-x-2">
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Digite o título da notícia"
              required
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
              required
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger>
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
            <Label htmlFor="image_url">URL da Imagem</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => handleChange("image_url", e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {formData.image_url && (
              <div className="mt-2">
                <img
                  src={formData.image_url || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md border"
                />
              </div>
            )}
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
    </form>
  )
}
