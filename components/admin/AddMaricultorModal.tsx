"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, User, Mail, Phone, MapPin, IdCard, Loader2, UserPlus, Factory, FileText, ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface AddMaricultorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddMaricultorModal({ isOpen, onClose, onSuccess }: AddMaricultorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    birth_date: "",
    phone: "",
    cep: "",
    logradouro: "",
    numero: "",
    cidade: "",
    estado: "",
    company: "",
    specialties: "",
  })
  const [coords, setCoords] = useState<{ latitude: number | null; longitude: number | null }>({ latitude: null, longitude: null })
  const logradouroRef = useRef<HTMLInputElement | null>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<any>(null)
  const [addressLocked, setAddressLocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState("")

  const [logoFile, setLogoFile] = useState<File | null>(null)

  const [documents, setDocuments] = useState<{
    rg: File | null
    cpf: File | null
    comprovante_endereco: File | null
    cnh: File | null
    cessao_aguas: File | null
    outros: File | null
    outros_label: string
  }>({
    rg: null,
    cpf: null,
    comprovante_endereco: null,
    cnh: null,
    cessao_aguas: null,
    outros: null,
    outros_label: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Máscara de CPF: 000.000.000-00
    if (name === 'cpf') {
      const onlyDigits = value.replace(/\D/g, '')
      const masked = onlyDigits
        .slice(0, 11)
        .replace(/(\d{3})(\d{0,3})(\d{0,3})(\d{0,2})/, (_, a, b, c, d) => {
          let result = a
          if (b) result += '.' + b
          if (c) result += '.' + c
          if (d) result += '-' + d
          return result
        })
      setFormData(prev => ({ ...prev, cpf: masked }))
      return
    }
    
    // Máscara data de nascimento DD/MM/AAAA
    if (name === 'birth_date') {
      const onlyDigits = value.replace(/\D/g, '').slice(0, 8)
      let masked = onlyDigits
      if (onlyDigits.length > 2) masked = onlyDigits.slice(0, 2) + '/' + onlyDigits.slice(2)
      if (onlyDigits.length > 4) masked = masked.slice(0, 5) + '/' + onlyDigits.slice(4)
      setFormData(prev => ({ ...prev, birth_date: masked }))
      return
    }

    // Máscara de telefone
    if (name === 'phone') {
      const onlyDigits = value.replace(/\D/g, '')
      let masked = onlyDigits
      
      if (onlyDigits.length <= 10) {
        masked = onlyDigits
          .slice(0, 10)
          .replace(/(\d{2})(\d{0,4})(\d{0,4})/, (_, ddd, part1, part2) => {
            if (part2) return `(${ddd}) ${part1}-${part2}`
            if (part1) return `(${ddd}) ${part1}`
            if (ddd) return `(${ddd}`
            return ''
          })
      } else {
        masked = onlyDigits
          .slice(0, 11)
          .replace(/(\d{2})(\d{5})(\d{0,4})/, (_, ddd, part1, part2) => {
            if (part2) return `(${ddd}) ${part1}-${part2}`
            if (part1) return `(${ddd}) ${part1}`
            return `(${ddd}`
          })
      }
      
      setFormData(prev => ({ ...prev, phone: masked }))
      return
    }
    
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const onlyDigits = raw.replace(/\D/g, "")
    // Máscara CEP 00000-000
    const masked = onlyDigits
      .slice(0, 8)
      .replace(/(\d{5})(\d{1,3})?/, (_, a: string, b?: string) => (b ? `${a}-${b}` : a))
    setFormData((prev) => ({ ...prev, cep: masked }))
    setCepError("")
    
    // Limpar endereço se CEP incompleto
    if (onlyDigits.length < 8) {
      setAddressLocked(false)
      if (onlyDigits.length === 0) {
        setFormData((prev) => ({ ...prev, logradouro: '', cidade: '', estado: '' }))
      }
      return
    }
    
    if (onlyDigits.length !== 8) return
    
    setCepLoading(true)
    setCepError("")
    
    try {
      let logradouro = ''
      let cidade = ''
      let estado = ''
      let encontrado = false
      
      // Tentativa 1: ViaCEP
      try {
        const resViaCep = await fetch(`https://viacep.com.br/ws/${onlyDigits}/json/`, { 
          cache: 'no-store',
          headers: { 'Accept': 'application/json' }
        })
        
        if (resViaCep.ok) {
          const dataViaCep = await resViaCep.json()
          
          if (!dataViaCep?.erro) {
            logradouro = dataViaCep.logradouro || ''
            cidade = dataViaCep.localidade || ''
            estado = dataViaCep.uf || ''
            encontrado = true
          }
        }
      } catch (errViaCep) {
        console.warn('⚠️ ViaCEP falhou, tentando BrasilAPI...')
      }
      
      // Tentativa 2: BrasilAPI (fallback)
      if (!encontrado) {
        try {
          const resBrasilAPI = await fetch(`https://brasilapi.com.br/api/cep/v1/${onlyDigits}`, {
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
          })
          
          if (resBrasilAPI.ok) {
            const dataBrasilAPI = await resBrasilAPI.json()
            
            logradouro = dataBrasilAPI.street || ''
            cidade = dataBrasilAPI.city || ''
            estado = dataBrasilAPI.state || ''
            encontrado = true
          }
        } catch (errBrasilAPI) {
          console.warn('⚠️ BrasilAPI também falhou')
        }
      }
      
      // Se não encontrou em nenhuma API
      if (!encontrado || (!cidade && !estado)) {
        setCepError('CEP não encontrado. Verifique o número digitado.')
        setAddressLocked(false)
        return
      }
      
      // Se encontrou cidade/estado mas não o logradouro (CEP genérico)
      if (!logradouro && cidade && estado) {
        setFormData((prev) => ({ ...prev, logradouro: '', cidade, estado }))
        setCepError('') // Não é erro, só CEP genérico
        setAddressLocked(false) // Permite edição do logradouro
        return
      }
      
      // Sucesso completo
      setFormData((prev) => ({ ...prev, logradouro, cidade, estado }))
      setAddressLocked(true)
      setSuggestions([])
      setShowSuggestions(false)
      
    } catch (err) {
      console.error('❌ Erro ao buscar CEP:', err)
      setCepError('Erro ao buscar CEP. Verifique sua conexão e tente novamente.')
      setAddressLocked(false)
    } finally {
      setCepLoading(false)
    }
  }

  // Autocomplete com Geoapify (desativado quando endereço estiver travado por CEP)
  useEffect(() => {
    if (addressLocked) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const text = formData.logradouro?.trim()
    if (!text || text.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY
        const queryParts = [text]
        const hasCidade = Boolean(formData.cidade && formData.cidade.trim())
        const hasEstado = Boolean(formData.estado && formData.estado.trim())
        if (hasCidade) queryParts.push(formData.cidade)
        if (hasEstado) queryParts.push(formData.estado)
        const q = encodeURIComponent(queryParts.join(', '))
        const filters: string[] = ['countrycode:br']
        if (hasEstado) filters.push(`statecode:${encodeURIComponent(formData.estado)}`)
        if (hasCidade) filters.push(`place:${encodeURIComponent(formData.cidade)}`)
        const filterParam = filters.join(',')
        const biasParam = hasCidade ? `&bias=city:${encodeURIComponent(formData.cidade)}` : ''
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${q}&type=street,address&limit=10&lang=pt&filter=${filterParam}${biasParam}&apiKey=${apiKey}`
        const res = await fetch(url, { cache: 'no-store' })
        const data = await res.json()
        const feats = data?.features || data?.results || []
        setSuggestions(Array.isArray(feats) ? feats : [])
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 150)
  }, [formData.logradouro, formData.cidade, formData.estado, addressLocked])

  const handleSelectSuggestion = (item: any) => {
    const p = item?.properties || item || {}
    const rua = p.address_line1 || p.formatted || p.name || ''
    const cidade = p.city || p.town || p.village || p.municipality || formData.cidade
    const estado = p.state_code || p.state || formData.estado

    setFormData((prev) => ({
      ...prev,
      logradouro: rua,
      cidade: cidade || prev.cidade,
      estado: estado || prev.estado,
    }))
    const lat = typeof p.lat === 'number' ? p.lat : (item?.geometry?.coordinates?.[1] ?? null)
    const lon = typeof p.lon === 'number' ? p.lon : (item?.geometry?.coordinates?.[0] ?? null)
    setCoords({ latitude: lat, longitude: lon })
    setShowSuggestions(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validações
    if (!formData.name || !formData.email || !formData.cpf) {
      toast.error("Preencha todos os campos obrigatórios")
      setLoading(false)
      return
    }

    // Validar CPF (11 dígitos)
    const cpfDigits = formData.cpf.replace(/\D/g, '')
    if (cpfDigits.length !== 11) {
      toast.error("CPF deve ter 11 dígitos")
      setLoading(false)
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Email inválido")
      setLoading(false)
      return
    }

    try {
      // Chamar API para cadastrar maricultor pelo admin
      const response = await fetch('/api/admin/maricultors/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          cpf: cpfDigits,
          phone: formData.phone,
          birth_date: formData.birth_date
            ? (() => {
                const p = formData.birth_date.replace(/\D/g, '')
                if (p.length !== 8) return null
                return `${p.slice(4, 8)}-${p.slice(2, 4)}-${p.slice(0, 2)}`
              })()
            : null,
          cep: formData.cep.replace(/\D/g, ''),
          logradouro: [formData.logradouro, formData.numero].filter(Boolean).join(', '),
          cidade: formData.cidade,
          estado: formData.estado,
          company: formData.company,
          specialties: formData.specialties,
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const maricultorId = data.maricultor_id
        const hasDocs =
          documents.rg ||
          documents.cpf ||
          documents.comprovante_endereco ||
          documents.cnh ||
          documents.cessao_aguas ||
          documents.outros

        if (logoFile && maricultorId) {
          try {
            const logoForm = new FormData()
            logoForm.append("logo", logoFile)
            const logoRes = await fetch(`/api/admin/maricultors/${maricultorId}/logo`, {
              method: "POST",
              body: logoForm,
            })
            if (!logoRes.ok) {
              const logoData = await logoRes.json()
              toast.error(logoData.error || "Erro ao enviar logo")
            }
          } catch {
            toast.error("Falha ao enviar logo.")
          }
        }

        if (hasDocs && maricultorId) {
          const docForm = new FormData()
          if (documents.rg) docForm.append("rg", documents.rg)
          if (documents.cpf) docForm.append("cpf", documents.cpf)
          if (documents.comprovante_endereco)
            docForm.append("comprovante_endereco", documents.comprovante_endereco)
          if (documents.cnh) docForm.append("cnh", documents.cnh)
          if (documents.cessao_aguas)
            docForm.append("cessao_aguas", documents.cessao_aguas)
          if (documents.outros) {
            docForm.append("outros", documents.outros)
            if (documents.outros_label)
              docForm.append("outros_label", documents.outros_label)
          }
          try {
            const docRes = await fetch(
              `/api/admin/maricultors/${maricultorId}/documents`,
              { method: "POST", body: docForm }
            )
            const docData = await docRes.json()
            if (!docRes.ok) {
              toast.error(docData.error || "Erro ao enviar documentos")
              setLoading(false)
              return
            }
            if (docData.count > 0) {
              toast.success(
                `Maricultor cadastrado! ${docData.count} documento(s) anexado(s).`
              )
            } else {
              toast.success("Maricultor cadastrado com sucesso!")
            }
          } catch {
            toast.success("Maricultor cadastrado. Falha ao anexar documentos.")
          }
        } else {
          toast.success("Maricultor cadastrado com sucesso!")
        }
        onSuccess()
        onClose()
        setLogoFile(null)
        setFormData({
          name: "",
          email: "",
          cpf: "",
          birth_date: "",
          phone: "",
          cep: "",
          logradouro: "",
          numero: "",
          cidade: "",
          estado: "",
          company: "",
          specialties: "",
        })
        setDocuments({
          rg: null,
          cpf: null,
          comprovante_endereco: null,
          cnh: null,
          cessao_aguas: null,
          outros: null,
          outros_label: "",
        })
      } else {
        toast.error(data.error || "Erro ao cadastrar maricultor")
      }
    } catch (error) {
      toast.error("Erro ao cadastrar maricultor. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  // Renderização condicional APÓS todos os hooks e funções
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-black/5">
        {/* Header Moderno */}
        <div className="relative bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 px-8 py-6 flex items-center justify-between flex-shrink-0 overflow-hidden">
          {/* Decoração de fundo */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-md">Cadastrar Novo Maricultor</h2>
              <p className="text-white/95 text-sm">Preencha os dados do produtor • Senha: 6 dígitos do CPF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:scale-105 relative z-10"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content - Scrollável */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="space-y-8">
            {/* Dados Pessoais - Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100/50 ring-1 ring-blue-500/10">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-100">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Dados Pessoais</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Nome Completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nome completo do maricultor"
                    required
                    className="rounded-xl border-2 border-blue-100 focus:border-blue-400 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-sm font-semibold">CPF *</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <Input
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      placeholder="000.000.000-00"
                      required
                      maxLength={14}
                      className="rounded-xl pl-10 border-2 border-blue-100 focus:border-blue-400 focus:ring-blue-100"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-1.5 w-1.5 bg-blue-400 rounded-full"></div>
                    <p className="text-xs text-blue-600 font-medium">
                      Senha: primeiros 6 dígitos do CPF
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date" className="text-sm font-semibold">Data de nascimento</Label>
                  <Input
                    id="birth_date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className="rounded-xl border-2 border-blue-100 focus:border-blue-400 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">E-mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@exemplo.com"
                      required
                      className="rounded-xl pl-10 border-2 border-blue-100 focus:border-blue-400 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      className="rounded-xl pl-10 border-2 border-blue-100 focus:border-blue-400 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço - Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100/50 ring-1 ring-emerald-500/10">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Endereço</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. CEP */}
                <div className="space-y-2">
                  <Label htmlFor="cep" className="text-sm font-semibold">CEP</Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      name="cep"
                      inputMode="numeric"
                      value={formData.cep}
                      onChange={handleCepChange}
                      placeholder="Ex: 01001-000"
                      maxLength={9}
                      className={`rounded-xl border-2 ${cepError ? 'border-red-300 focus:ring-red-200' : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'} ${cepLoading ? 'opacity-70' : ''}`}
                      disabled={cepLoading}
                    />
                    {cepLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                  {cepError && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span>⚠️</span>
                      {cepError}
                    </p>
                  )}
                  {formData.cep && !cepError && !cepLoading && addressLocked && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span>✓</span>
                      Endereço encontrado com sucesso!
                    </p>
                  )}
                  {formData.cep && !cepError && !cepLoading && !addressLocked && formData.cidade && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <span>ℹ️</span>
                      CEP genérico. Cidade/Estado preenchidos. Complete o logradouro abaixo.
                    </p>
                  )}
                  {!formData.cep && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span>💡</span>
                      Digite seu CEP para preencher o endereço automaticamente
                    </p>
                  )}
                </div>

                {/* 2. Logradouro */}
                <div className="space-y-2 relative">
                  <Label htmlFor="logradouro" className="text-sm font-semibold">Logradouro</Label>
                  <Input
                    id="logradouro"
                    name="logradouro"
                    value={formData.logradouro}
                    onChange={handleChange}
                    placeholder={!formData.cep || formData.cep.length < 9 ? "Preencha o CEP primeiro" : "Rua e complemento"}
                    className={`rounded-xl border-2 ${!formData.cep || formData.cep.length < 9 ? 'opacity-60 cursor-not-allowed border-emerald-100' : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'}`}
                    ref={logradouroRef}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    disabled={!formData.cep || formData.cep.length < 9 || addressLocked}
                    readOnly={addressLocked}
                  />
                  
                  {/* Autocomplete Geoapify */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-border rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                      {suggestions.map((item, idx) => {
                        const p = item?.properties || item || {}
                        const primary = p.address_line1 || p.formatted || p.name
                        const secondary = p.address_line2 || [p.city, p.state_code || p.state].filter(Boolean).join(' - ')
                        return (
                          <button
                            key={idx}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelectSuggestion(item)}
                            className="block w-full text-left px-3 py-2 hover:bg-muted/50"
                          >
                            <div className="text-sm font-medium text-foreground">{primary}</div>
                            {secondary && (
                              <div className="text-xs text-muted-foreground">{secondary}</div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Número */}
                <div className="space-y-2">
                  <Label htmlFor="numero" className="text-sm font-semibold">Número</Label>
                  <Input
                    id="numero"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    placeholder="Nº"
                    className={`rounded-xl border-2 ${!formData.cep || formData.cep.length < 9 ? 'opacity-60 cursor-not-allowed border-emerald-100' : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'}`}
                    disabled={!formData.cep || formData.cep.length < 9}
                  />
                </div>

                {/* 4. Cidade */}
                <div className="space-y-2">
                  <Label htmlFor="cidade" className="text-sm font-semibold">Cidade</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder={!formData.cep || formData.cep.length < 9 ? "Preencha o CEP primeiro" : "Ex: Ubatuba"}
                    className={`rounded-xl border-2 ${!formData.cep || formData.cep.length < 9 ? 'opacity-60 cursor-not-allowed border-emerald-100' : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'}`}
                    disabled={!formData.cep || formData.cep.length < 9}
                    readOnly={formData.cidade && (formData.cep.length === 9)}
                  />
                </div>

                {/* 5. Estado */}
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-sm font-semibold">Estado (UF)</Label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border-2 rounded-xl bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 ${
                      !formData.cep || formData.cep.length < 9 ? 'opacity-60 cursor-not-allowed border-emerald-100' : 'border-emerald-100'
                    }`}
                    disabled={!formData.cep || formData.cep.length < 9 || (formData.estado && formData.cep.length === 9)}
                  >
                    <option value="">Selecione</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Empresa/Especialidades - Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100/50 ring-1 ring-purple-500/10">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-100">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  <Factory className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Informações Profissionais</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-semibold">Empresa/Fazenda</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Nome da empresa ou fazenda aquícola"
                    className="rounded-xl border-2 border-purple-100 focus:border-purple-400 focus:ring-purple-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialties" className="text-sm font-semibold">Especialidades</Label>
                  <Input
                    id="specialties"
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleChange}
                    placeholder="Ex: Cultivo de ostras, mexilhões..."
                    className="rounded-xl border-2 border-purple-100 focus:border-purple-400 focus:ring-purple-100"
                  />
                </div>
              </div>
            </div>

            {/* Logo - Card (opcional) */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 ring-1 ring-slate-200/50">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-md">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Logo</h3>
                  <p className="text-sm text-slate-500">Opcional • Aparece no mapa da home (JPEG, PNG ou WebP, até 2 MB)</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Imagem da logo</Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="rounded-xl border-2 border-slate-200 focus:border-slate-400"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                />
                {logoFile && (
                  <p className="text-xs text-green-600 truncate">{logoFile.name}</p>
                )}
              </div>
            </div>

            {/* Documentos - Card (opcional) */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100/50 ring-1 ring-amber-500/10">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-100">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Documentos</h3>
                  <p className="text-sm text-slate-500">Opcional • PDF ou imagem, até 10 MB cada</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "rg" as const, label: "RG" },
                  { key: "cpf" as const, label: "CPF" },
                  { key: "comprovante_endereco" as const, label: "Comprovante de endereço" },
                  { key: "cnh" as const, label: "CNH" },
                  { key: "cessao_aguas" as const, label: "Cessão de Águas" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-sm font-semibold">{label}</Label>
                    <Input
                      type="file"
                      accept=".pdf,image/jpeg,image/jpg,image/png,image/webp"
                      className="rounded-xl border-2 border-amber-100 focus:border-amber-400"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        setDocuments((prev) => ({ ...prev, [key]: f || null }))
                      }}
                    />
                    {documents[key] && (
                      <p className="text-xs text-green-600 truncate">{documents[key]?.name}</p>
                    )}
                  </div>
                ))}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-semibold">Outros</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="text"
                      placeholder="Descrição (opcional)"
                      value={documents.outros_label}
                      onChange={(e) =>
                        setDocuments((prev) => ({ ...prev, outros_label: e.target.value }))
                      }
                      className="rounded-xl border-2 border-amber-100 flex-1"
                    />
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept=".pdf,image/jpeg,image/jpg,image/png,image/webp"
                        className="rounded-xl border-2 border-amber-100 focus:border-amber-400"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          setDocuments((prev) => ({ ...prev, outros: f || null }))
                        }}
                      />
                      {documents.outros && (
                        <p className="text-xs text-green-600 truncate mt-1">{documents.outros.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Moderno */}
        <div className="px-8 py-5 bg-gradient-to-r from-slate-50 to-blue-50/50 border-t border-slate-200/60 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-slate-600 font-medium">
              * Campos obrigatórios
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="rounded-xl px-6 border-2 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-700 hover:via-cyan-600 hover:to-teal-500 text-white shadow-xl rounded-xl px-8 py-2.5 font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Cadastrar Maricultor
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

