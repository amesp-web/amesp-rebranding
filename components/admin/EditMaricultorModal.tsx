"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Loader2, MapPin, Phone, User, Building2, Fish, Save } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface EditMaricultorModalProps {
  isOpen: boolean
  onClose: () => void
  maricultor: {
    id: string
    full_name: string
    cpf?: string
    contact_phone?: string
    logradouro?: string
    numero?: string
    cidade?: string
    estado?: string
    cep?: string
    company?: string
    specialties?: string
  }
}

// Funções de formatação fora do componente para evitar recriação
const formatCPF = (value: string) => {
  if (!value) return ""
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length === 0) return ""
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return cleaned.replace(/(\d{3})(\d{0,3})/, "$1.$2")
  if (cleaned.length <= 9) return cleaned.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3")
  return cleaned.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

const formatCEP = (value: string) => {
  if (!value) return ""
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length === 0) return ""
  if (cleaned.length <= 5) return cleaned
  if (cleaned.length <= 8) {
    return cleaned.replace(/(\d{5})(\d{0,3})/, "$1-$2")
  }
  return cleaned.slice(0, 8).replace(/(\d{5})(\d{3})/, "$1-$2")
}

const formatPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  }
  return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
}

export function EditMaricultorModal({ isOpen, onClose, maricultor }: EditMaricultorModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: "",
    cpf: "",
    contact_phone: "",
    cep: "",
    logradouro: "",
    numero: "",
    cidade: "",
    estado: "",
    company: "",
    specialties: ""
  })

  // Preencher formulário quando o modal abrir
  useEffect(() => {
    if (isOpen && maricultor) {
      setFormData({
        full_name: maricultor.full_name || "",
        cpf: formatCPF(maricultor.cpf || ""),
        contact_phone: maricultor.contact_phone || "",
        cep: formatCEP(maricultor.cep || ""),
        logradouro: maricultor.logradouro || "",
        numero: maricultor.numero || "",
        cidade: maricultor.cidade || "",
        estado: maricultor.estado || "",
        company: maricultor.company || "",
        specialties: maricultor.specialties || ""
      })
    }
  }, [isOpen, maricultor])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Aplicar máscaras
    if (name === "cpf") {
      setFormData(prev => ({ ...prev, cpf: formatCPF(value) }))
      return
    }
    if (name === "cep") {
      const formatted = formatCEP(value)
      setFormData(prev => ({ ...prev, cep: formatted }))
      
      // Buscar CEP automaticamente quando completar 9 caracteres (00000-000)
      if (formatted.length === 9) {
        handleCEPSearch(formatted)
      }
      return
    }
    if (name === "contact_phone") {
      setFormData(prev => ({ ...prev, contact_phone: formatPhone(value) }))
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Buscar CEP via ViaCEP
  const handleCEPSearch = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, "")
    if (cleanCEP.length !== 8) return

    setCepLoading(true)
    try {
      // Tentar ViaCEP primeiro
      const viaCepRes = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const viaCepData = await viaCepRes.json()

      if (!viaCepData.erro) {
        setFormData(prev => ({
          ...prev,
          logradouro: viaCepData.logradouro || prev.logradouro,
          cidade: viaCepData.localidade || prev.cidade,
          estado: viaCepData.uf || prev.estado
        }))
        toast.success("CEP encontrado!")
        return
      }

      // Fallback: BrasilAPI
      const brasilApiRes = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCEP}`)
      const brasilApiData = await brasilApiRes.json()

      if (brasilApiData.cep) {
        setFormData(prev => ({
          ...prev,
          logradouro: brasilApiData.street || prev.logradouro,
          cidade: brasilApiData.city || prev.cidade,
          estado: brasilApiData.state || prev.estado
        }))
        toast.success("CEP encontrado!")
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
      toast.error("CEP não encontrado")
    } finally {
      setCepLoading(false)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/maricultors/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: maricultor.id,
          ...formData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar maricultor")
      }

      toast.success("Maricultor atualizado com sucesso!")
      router.refresh()
      onClose()
    } catch (error: any) {
      console.error("Erro:", error)
      toast.error(error.message || "Erro ao atualizar maricultor")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
      onClick={(e) => {
        // Fechar modal se clicar no backdrop
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Editar Maricultor</h2>
                <p className="text-sm text-white/80">Atualize as informações do produtor</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Card 1: Dados Pessoais */}
          <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 p-6 space-y-4 border border-cyan-200/50 dark:border-cyan-800/50">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
              <User className="h-5 w-5" />
              Dados Pessoais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">Nome Completo *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Nome completo"
                  required
                  className="border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm font-medium">CPF *</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                  className="border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone" className="text-sm font-medium">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="pl-10 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Endereço */}
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 space-y-4 border border-blue-200/50 dark:border-blue-800/50">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <MapPin className="h-5 w-5" />
              Endereço
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep" className="text-sm font-medium">CEP</Label>
                <div className="relative">
                  <Input
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    placeholder="00000-000"
                    maxLength={9}
                    className="border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {cepLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
                  )}
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="logradouro" className="text-sm font-medium">Logradouro</Label>
                <Input
                  id="logradouro"
                  name="logradouro"
                  value={formData.logradouro}
                  onChange={handleChange}
                  placeholder="Rua, avenida, etc"
                  className="border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero" className="text-sm font-medium">Número</Label>
                <Input
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  placeholder="Nº"
                  className="border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade" className="text-sm font-medium">Cidade</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  placeholder="Cidade"
                  className="border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado" className="text-sm font-medium">Estado (UF)</Label>
                <Input
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  placeholder="UF"
                  maxLength={2}
                  className="border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Profissional */}
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-6 space-y-4 border border-indigo-200/50 dark:border-indigo-800/50">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <Fish className="h-5 w-5" />
              Informações Profissionais
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium">Empresa/Fazenda</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Nome da empresa ou fazenda"
                    className="pl-10 border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialties" className="text-sm font-medium">Especialidades</Label>
                <Textarea
                  id="specialties"
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleChange}
                  placeholder="Ex: Cultivo de Ostras, Mexilhões, Vieiras..."
                  rows={3}
                  className="resize-none border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Footer com botões */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

