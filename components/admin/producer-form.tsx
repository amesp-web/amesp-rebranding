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
import { ArrowLeft, Save, Plus, X } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface ProducerFormProps {
  initialData?: any
}

export function ProducerForm({ initialData }: ProducerFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    latitude: initialData?.latitude || "",
    longitude: initialData?.longitude || "",
    contact_email: initialData?.contact_email || "",
    contact_phone: initialData?.contact_phone || "",
    website: initialData?.website || "",
    image_url: initialData?.image_url || "",
    specialties: initialData?.specialties || [],
    certification_level: initialData?.certification_level || "",
    active: initialData?.active ?? true,
  })
  const [newSpecialty, setNewSpecialty] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const producerData = {
        ...formData,
        latitude: formData.latitude ? Number.parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? Number.parseFloat(formData.longitude) : null,
        updated_at: new Date().toISOString(),
      }

      let result
      if (initialData?.id) {
        // Update existing producer
        result = await supabase.from("producers").update(producerData).eq("id", initialData.id)
      } else {
        // Create new producer
        result = await supabase.from("producers").insert([producerData])
      }

      if (result.error) throw result.error

      router.push("/admin/producers")
      router.refresh()
    } catch (error) {
      console.error("Error saving producer:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()],
      }))
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s: string) => s !== specialty),
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/admin/producers">
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
            <Label htmlFor="name">Nome do Produtor *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Digite o nome do produtor"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Breve descrição do produtor e suas atividades"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">E-mail de Contato</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                placeholder="contato@produtor.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Telefone de Contato</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => handleChange("contact_phone", e.target.value)}
                placeholder="(12) 3456-7890"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://www.produtor.com"
            />
          </div>

          <div className="space-y-4">
            <Label>Especialidades</Label>
            <div className="flex gap-2">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Digite uma especialidade"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
              />
              <Button type="button" onClick={addSpecialty} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((specialty: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {specialty}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => removeSpecialty(specialty)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="location">Localização *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Cidade - Estado"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleChange("latitude", e.target.value)}
                placeholder="-23.4336"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleChange("longitude", e.target.value)}
                placeholder="-45.0838"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certification_level">Nível de Certificação</Label>
            <Select
              value={formData.certification_level}
              onValueChange={(value) => handleChange("certification_level", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma certificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ASC Certificado">ASC Certificado</SelectItem>
                <SelectItem value="Orgânico Certificado">Orgânico Certificado</SelectItem>
                <SelectItem value="ISO 14001">ISO 14001</SelectItem>
                <SelectItem value="Certificação Ambiental">Certificação Ambiental</SelectItem>
                <SelectItem value="Em Processo">Em Processo</SelectItem>
                <SelectItem value="Sem Certificação">Sem Certificação</SelectItem>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleChange("active", checked)}
            />
            <Label htmlFor="active">Produtor ativo</Label>
          </div>
        </div>
      </div>
    </form>
  )
}
