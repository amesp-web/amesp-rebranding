"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Home, Upload, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function HomeInfoPage() {
  const [badgeText, setBadgeText] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [sustainabilityTag, setSustainabilityTag] = useState('')
  const [yearsExperience, setYearsExperience] = useState(25)
  const [associatedProducers, setAssociatedProducers] = useState(100)
  const [completedProjects, setCompletedProjects] = useState(50)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/home-info', { cache: 'no-store' })
      const data = await res.json()
      if (data) {
        setBadgeText(data.badge_text || '')
        setTitle(data.title || '')
        setDescription(data.description || '')
        setHeroImageUrl(data.hero_image_url || '')
        setSustainabilityTag(data.sustainability_tag || '')
        setYearsExperience(data.years_experience || 25)
        setAssociatedProducers(data.associated_producers || 100)
        setCompletedProjects(data.completed_projects || 50)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar informações')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande! Máximo 10MB')
      return
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem')
      return
    }

    setUploading(true)
    try {
      const fileName = `hero-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const { data, error } = await supabase.storage
        .from('home')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('home')
        .getPublicUrl(fileName)

      setHeroImageUrl(urlData.publicUrl)
      toast.success('Imagem carregada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      toast.error('Erro ao fazer upload da imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Título e descrição são obrigatórios')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/home-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badge_text: badgeText,
          title,
          description,
          hero_image_url: heroImageUrl,
          sustainability_tag: sustainabilityTag,
          years_experience: yearsExperience,
          associated_producers: associatedProducers,
          completed_projects: completedProjects
        })
      })

      if (!res.ok) throw new Error('Erro ao salvar')

      toast.success('Informações atualizadas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar informações')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header com gradiente oceânico */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 border-0 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-2">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Infos da Home</h1>
              <p className="text-white/90">Gerencie as informações do banner principal (Hero)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <Card className="mb-6 border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b">
          <CardTitle>Informações do Banner Principal</CardTitle>
          <CardDescription>
            Edite o texto e imagem exibidos no topo da home page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Badge/Tag */}
          <div>
            <Label htmlFor="badge">Tag Superior (ex: "Desde 1998")</Label>
            <Input
              id="badge"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="Desde 1998"
              className="mt-2"
            />
          </div>

          {/* Título */}
          <div>
            <Label htmlFor="title">Título Principal *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Associação dos Maricultores..."
              className="mt-2"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Trabalhamos para o desenvolvimento..."
              className="mt-2 min-h-[120px]"
              required
            />
          </div>

          {/* Imagem Hero */}
          <div>
            <Label>Imagem Principal</Label>
            <div className="mt-2 space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50 h-auto py-8"
              >
                <div className="flex flex-col items-center gap-2">
                  {uploading ? (
                    <>
                      <Upload className="h-8 w-8 text-blue-600 animate-bounce" />
                      <span className="text-sm text-blue-600">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-blue-600" />
                      <span className="text-sm font-medium text-slate-700">
                        {heroImageUrl ? 'Alterar Imagem' : 'Escolher Imagem'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP até 10MB
                      </span>
                    </>
                  )}
                </div>
              </Button>

              {/* Preview da imagem */}
              {heroImageUrl && (
                <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 aspect-[16/9]">
                  <img
                    src={heroImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Preview
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tag Sustentabilidade */}
          <div>
            <Label htmlFor="sustainability">Tag de Sustentabilidade</Label>
            <Input
              id="sustainability"
              value={sustainabilityTag}
              onChange={(e) => setSustainabilityTag(e.target.value)}
              placeholder="100% Sustentável"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Texto exibido no card de sustentabilidade sobre a imagem
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card de Estatísticas */}
      <Card className="mb-6 border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b">
          <CardTitle>Estatísticas</CardTitle>
          <CardDescription>
            Números exibidos na seção de estatísticas da home
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Anos de Experiência */}
            <div>
              <Label htmlFor="years">Anos de Experiência</Label>
              <Input
                id="years"
                type="text"
                inputMode="numeric"
                value={yearsExperience}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setYearsExperience(parseInt(val) || 0)
                }}
                className="mt-2"
                placeholder="25"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Será exibido como "{yearsExperience}+"
              </p>
            </div>

            {/* Produtores Associados */}
            <div>
              <Label htmlFor="producers">Produtores Associados</Label>
              <Input
                id="producers"
                type="text"
                inputMode="numeric"
                value={associatedProducers}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setAssociatedProducers(parseInt(val) || 0)
                }}
                className="mt-2"
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Será exibido como "{associatedProducers}+"
              </p>
            </div>

            {/* Projetos Realizados */}
            <div>
              <Label htmlFor="projects">Projetos Realizados</Label>
              <Input
                id="projects"
                type="text"
                inputMode="numeric"
                value={completedProjects}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setCompletedProjects(parseInt(val) || 0)
                }}
                className="mt-2"
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Será exibido como "{completedProjects}+"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões Ações */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/admin'}
          className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl px-6 py-2 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-150 rounded-xl px-6 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  )
}

