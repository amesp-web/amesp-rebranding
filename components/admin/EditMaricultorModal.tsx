"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Loader2, MapPin, Phone, User, Building2, Fish, Save, Mail, FileText, Download, Trash2, Upload, ImageIcon } from "lucide-react"
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
    birth_date?: string | null
    logradouro?: string
    cidade?: string
    estado?: string
    cep?: string
    company?: string
    specialties?: string
    logo_path?: string | null
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

const formatBirthDate = (value: string | null | undefined): string => {
  if (!value) return ""
  const d = value.slice(0, 10)
  if (d.length < 10 || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
  return `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`
}

const documentTypeLabel: Record<string, string> = {
  rg: "RG",
  cpf: "CPF",
  comprovante_endereco: "Comprovante de endereço",
  cnh: "CNH",
  cessao_aguas: "Cessão de Águas",
  outros: "Outros",
}

export function EditMaricultorModal({ isOpen, onClose, maricultor }: EditMaricultorModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Array<{
    id: string
    type: string
    label: string | null
    file_name: string
    content_type: string | null
    file_size_bytes: number | null
    signed_url: string | null
  }>>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
  const [newDocType, setNewDocType] = useState("rg")
  const [newDocFile, setNewDocFile] = useState<File | null>(null)
  const [newDocOutrosLabel, setNewDocOutrosLabel] = useState("")
  const [uploadDocLoading, setUploadDocLoading] = useState(false)
  const [newDocFileKey, setNewDocFileKey] = useState(0)
  const [localLogoPath, setLocalLogoPath] = useState<string | null>(null)
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoRemoving, setLogoRemoving] = useState(false)
  const [logoInputKey, setLogoInputKey] = useState(0)
  const documentsFetchedRef = useRef(false)
  const documentsSectionRef = useRef<HTMLDivElement | null>(null)

  const supabaseUrl = typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" ? process.env.NEXT_PUBLIC_SUPABASE_URL : ""

  const fetchDocuments = async () => {
    if (!maricultor?.id || documentsFetchedRef.current) return
    documentsFetchedRef.current = true
    setDocumentsLoading(true)
    try {
      const res = await fetch(`/api/admin/maricultors/${maricultor.id}/documents`)
      const data = await res.json()
      setDocuments(data.documents ?? [])
    } catch {
      setDocuments([])
    } finally {
      setDocumentsLoading(false)
    }
  }

  const [formData, setFormData] = useState({
    full_name: "",
    cpf: "",
    contact_phone: "",
    birth_date: "",
    cep: "",
    logradouro: "",
    numero: "",
    cidade: "",
    estado: "",
    company: "",
    specialties: ""
  })

  // Buscar e-mail do maricultor (auth.users) quando o modal abrir
  useEffect(() => {
    if (!isOpen || !maricultor?.id) {
      setEmail(null)
      return
    }
    let cancelled = false
    fetch(`/api/admin/maricultors/${maricultor.id}/email`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!cancelled && data?.email) setEmail(data.email)
      })
      .catch(() => { if (!cancelled) setEmail(null) })
    return () => { cancelled = true }
  }, [isOpen, maricultor?.id])

  // Lazy load documentos: quando a seção Documentos entrar em vista ou após 400ms (evita travar abertura do modal)
  useEffect(() => {
    if (!isOpen || !maricultor?.id) {
      setDocuments([])
      documentsFetchedRef.current = false
      return
    }
    const el = documentsSectionRef.current
    if (!el) {
      const t = setTimeout(fetchDocuments, 400)
      return () => clearTimeout(t)
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchDocuments()
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    )
    obs.observe(el)
    const fallback = setTimeout(fetchDocuments, 400)
    return () => {
      obs.disconnect()
      clearTimeout(fallback)
    }
  }, [isOpen, maricultor?.id])

  // Manter "Adicionar documento" com tipo válido: se o tipo atual já existe (um por tipo), mudar para "outros"
  useEffect(() => {
    if (newDocType === "outros") return
    const alreadyHas = documents.some((d) => d.type === newDocType)
    if (alreadyHas) setNewDocType("outros")
  }, [documents, newDocType])

  // Preencher formulário quando o modal abrir
  useEffect(() => {
    if (isOpen && maricultor) {
      // Separar logradouro e número
      // Ex: "Avenida Antonio Pannellini, 505" -> logradouro: "Avenida Antonio Pannellini", numero: "505"
      let logradouroSeparado = maricultor.logradouro || ""
      let numeroSeparado = ""
      
      if (maricultor.logradouro) {
        const lastCommaIndex = maricultor.logradouro.lastIndexOf(",")
        if (lastCommaIndex !== -1) {
          logradouroSeparado = maricultor.logradouro.substring(0, lastCommaIndex).trim()
          numeroSeparado = maricultor.logradouro.substring(lastCommaIndex + 1).trim()
        }
      }
      
      setFormData({
        full_name: maricultor.full_name || "",
        cpf: formatCPF(maricultor.cpf || ""),
        contact_phone: maricultor.contact_phone || "",
        birth_date: formatBirthDate(maricultor.birth_date),
        cep: formatCEP(maricultor.cep || ""),
        logradouro: logradouroSeparado,
        numero: numeroSeparado,
        cidade: maricultor.cidade || "",
        estado: maricultor.estado || "",
        company: maricultor.company || "",
        specialties: maricultor.specialties || ""
      })
      setLocalLogoPath(maricultor.logo_path ?? null)
      setNewLogoFile(null)
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
    if (name === "birth_date") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 8)
      let masked = onlyDigits
      if (onlyDigits.length > 2) masked = onlyDigits.slice(0, 2) + "/" + onlyDigits.slice(2)
      if (onlyDigits.length > 4) masked = masked.slice(0, 5) + "/" + onlyDigits.slice(4)
      setFormData(prev => ({ ...prev, birth_date: masked }))
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
      // Concatenar logradouro e número antes de enviar
      const logradouroCompleto = [formData.logradouro, formData.numero].filter(Boolean).join(", ")
      
      const birthDateIso = formData.birth_date
        ? (() => {
            const p = formData.birth_date.replace(/\D/g, "")
            if (p.length !== 8) return null
            return `${p.slice(4, 8)}-${p.slice(2, 4)}-${p.slice(0, 2)}`
          })()
        : null

      const response = await fetch("/api/admin/maricultors/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: maricultor.id,
          ...formData,
          birth_date: birthDateIso,
          logradouro: logradouroCompleto
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
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
                <Label className="text-sm font-medium">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={email ?? "—"}
                    readOnly
                    disabled
                    className="pl-10 bg-muted/50 border-cyan-200 dark:border-cyan-800 text-muted-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground">E-mail de login (não editável)</p>
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

              <div className="space-y-2">
                <Label htmlFor="birth_date" className="text-sm font-medium">Data de nascimento</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className="border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500"
                />
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

          {/* Card 3.5: Logo */}
          <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 p-6 space-y-4 border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <ImageIcon className="h-5 w-5" />
              Logo
            </h3>
            <p className="text-sm text-muted-foreground">Aparece no mapa da home. JPEG, PNG ou WebP, até 2 MB.</p>
            <div className="flex flex-wrap items-start gap-4">
              {localLogoPath && supabaseUrl && (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`${supabaseUrl}/storage/v1/object/public/maricultor_logos/${localLogoPath}`}
                    alt="Logo atual"
                    className="h-20 w-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={logoRemoving}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={async () => {
                      if (!maricultor?.id) return
                      setLogoRemoving(true)
                      try {
                        const res = await fetch(`/api/admin/maricultors/${maricultor.id}/logo`, { method: "DELETE" })
                        if (res.ok) {
                          setLocalLogoPath(null)
                          toast.success("Logo removida.")
                        } else {
                          const data = await res.json()
                          toast.error(data.error || "Erro ao remover logo")
                        }
                      } catch {
                        toast.error("Erro ao remover logo")
                      } finally {
                        setLogoRemoving(false)
                      }
                    }}
                  >
                    {logoRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    <span className="ml-1">Remover logo</span>
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nova logo</Label>
                  <Input
                    key={logoInputKey}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 max-w-[200px]"
                    onChange={(e) => setNewLogoFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={!newLogoFile || logoUploading}
                  variant="secondary"
                  onClick={async () => {
                    if (!newLogoFile || !maricultor?.id) return
                    setLogoUploading(true)
                    try {
                      const form = new FormData()
                      form.append("logo", newLogoFile)
                      const res = await fetch(`/api/admin/maricultors/${maricultor.id}/logo`, {
                        method: "POST",
                        body: form,
                      })
                      const data = await res.json()
                      if (res.ok) {
                        setLocalLogoPath(data.logo_path ?? null)
                        setNewLogoFile(null)
                        setLogoInputKey((k) => k + 1)
                        toast.success("Logo atualizada.")
                      } else {
                        toast.error(data.error || "Erro ao enviar logo")
                      }
                    } catch {
                      toast.error("Erro ao enviar logo")
                    } finally {
                      setLogoUploading(false)
                    }
                  }}
                >
                  {logoUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span className="ml-1">Enviar logo</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Card 4: Documentos (ref para lazy load) */}
          <div
            ref={documentsSectionRef}
            className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-6 space-y-4 border border-amber-200/50 dark:border-amber-800/50"
          >
            <h3 className="font-semibold text-lg flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <FileText className="h-5 w-5" />
              Documentos
            </h3>
            {documentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Nenhum documento anexado.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => {
                  const isImage = doc.content_type?.startsWith("image/")
                  const typeLabel = doc.type === "outros" && doc.label ? doc.label : (documentTypeLabel[doc.type] ?? doc.type)
                  return (
                    <div
                      key={doc.id}
                      className="rounded-xl border border-amber-200/60 dark:border-amber-800/60 bg-white dark:bg-slate-900/50 p-3 flex flex-col relative group"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        disabled={deletingDocId === doc.id}
                        onClick={async () => {
                          if (!window.confirm("Remover este documento? O arquivo será excluído.")) return
                          setDeletingDocId(doc.id)
                          try {
                            const res = await fetch(
                              `/api/admin/maricultors/${maricultor.id}/documents/${doc.id}`,
                              { method: "DELETE" }
                            )
                            const data = await res.json()
                            if (!res.ok) throw new Error(data.error || "Erro ao remover")
                            toast.success("Documento removido.")
                            await fetchDocuments()
                          } catch (e: unknown) {
                            toast.error(e instanceof Error ? e.message : "Erro ao remover documento")
                          } finally {
                            setDeletingDocId(null)
                          }
                        }}
                      >
                        {deletingDocId === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                          {isImage ? (
                            <img
                              src={`/api/admin/maricultors/${maricultor.id}/documents/${doc.id}`}
                              alt={doc.file_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="h-8 w-8 text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-8">
                          <p className="text-xs font-medium text-amber-700 dark:text-amber-300 truncate">
                            {typeLabel}
                          </p>
                          <p className="text-xs text-muted-foreground truncate" title={doc.file_name}>
                            {doc.file_name}
                          </p>
                          <a
                            href={`/api/admin/maricultors/${maricultor.id}/documents/${doc.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={doc.file_name}
                            className="inline-flex items-center gap-1 mt-2 text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Baixar
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Adicionar documento */}
            <div className="mt-6 pt-4 border-t border-amber-200/60">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-3">Adicionar documento</p>
              <div className="flex flex-wrap items-start gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tipo</Label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    className="h-9 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-3 text-sm min-w-[160px]"
                  >
                    {Object.entries(documentTypeLabel)
                      .filter(
                        ([value]) =>
                          value === "outros" || !documents.some((d) => d.type === value)
                      )
                      .map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                  </select>
                </div>
                {newDocType === "outros" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Descrição</Label>
                    <Input
                      value={newDocOutrosLabel}
                      onChange={(e) => setNewDocOutrosLabel(e.target.value)}
                      placeholder="Ex: Licença"
                      className="h-9 w-40 rounded-lg border-amber-200 dark:border-amber-800"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-xs">Arquivo (PDF ou imagem)</Label>
                  <Input
                    key={newDocFileKey}
                    type="file"
                    accept=".pdf,image/jpeg,image/jpg,image/png,image/webp"
                    className="h-9 rounded-lg border-amber-200 dark:border-amber-800 max-w-[200px]"
                    onChange={(e) => setNewDocFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={!newDocFile || uploadDocLoading}
                  className="self-end bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={async () => {
                    if (!newDocFile || !maricultor?.id) return
                    setUploadDocLoading(true)
                    try {
                      const form = new FormData()
                      form.append(newDocType, newDocFile)
                      if (newDocType === "outros" && newDocOutrosLabel.trim())
                        form.append("outros_label", newDocOutrosLabel.trim())
                      const res = await fetch(`/api/admin/maricultors/${maricultor.id}/documents`, {
                        method: "POST",
                        body: form,
                      })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data.error || "Erro ao enviar")
                      toast.success("Documento adicionado.")
                      setNewDocFile(null)
                      setNewDocOutrosLabel("")
                      setNewDocFileKey((k) => k + 1)
                      await fetchDocuments()
                    } catch (e: unknown) {
                      toast.error(e instanceof Error ? e.message : "Erro ao adicionar documento")
                    } finally {
                      setUploadDocLoading(false)
                    }
                  }}
                >
                  {uploadDocLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-1" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                RG, CPF, CNH etc. permitem apenas um cada; &quot;Outros&quot; permite vários.
              </p>
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

