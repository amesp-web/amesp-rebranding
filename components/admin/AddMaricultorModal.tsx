"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, User, Mail, Phone, MapPin, IdCard, Loader2, UserPlus } from "lucide-react"
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

  if (!isOpen) return null

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
        toast.success("Maricultor cadastrado com sucesso!")
        onSuccess()
        onClose()
        
        // Resetar formulário
        setFormData({
          name: "",
          email: "",
          cpf: "",
          phone: "",
          cep: "",
          logradouro: "",
          numero: "",
          cidade: "",
          estado: "",
          company: "",
          specialties: "",
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Cadastrar Novo Maricultor</h2>
              <p className="text-white/90 text-sm">Preencha os dados do produtor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Content - Scrollável */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Dados Pessoais */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Dados Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nome completo do maricultor"
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      placeholder="000.000.000-00"
                      required
                      maxLength={14}
                      className="rounded-xl pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Senha gerada: primeiros 6 dígitos do CPF
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@exemplo.com"
                      required
                      className="rounded-xl pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      className="rounded-xl pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Endereço
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      name="cep"
                      inputMode="numeric"
                      value={formData.cep}
                      onChange={handleCepChange}
                      placeholder="Ex: 01001-000"
                      maxLength={9}
                      className={`rounded-xl ${cepError ? 'border-red-300 focus:ring-red-200' : ''} ${cepLoading ? 'opacity-70' : ''}`}
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

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado (UF)</Label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 ${
                      !formData.cep || formData.cep.length < 9 ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    disabled={!formData.cep || formData.cep.length < 9 || (formData.estado && formData.cep.length === 9)}
                  >
                    <option value="">Selecione</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder={!formData.cep || formData.cep.length < 9 ? "Preencha o CEP primeiro" : "Ex: Ubatuba"}
                    className={`rounded-xl ${!formData.cep || formData.cep.length < 9 ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={!formData.cep || formData.cep.length < 9}
                    readOnly={formData.cidade && (formData.cep.length === 9)}
                  />
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    name="logradouro"
                    value={formData.logradouro}
                    onChange={handleChange}
                    placeholder={!formData.cep || formData.cep.length < 9 ? "Preencha o CEP primeiro" : "Rua e complemento"}
                    className={`rounded-xl ${!formData.cep || formData.cep.length < 9 ? 'opacity-60 cursor-not-allowed' : ''}`}
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

                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    placeholder="Nº"
                    className={`rounded-xl ${!formData.cep || formData.cep.length < 9 ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={!formData.cep || formData.cep.length < 9}
                  />
                </div>
              </div>
            </div>

            {/* Empresa/Especialidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Empresa/Fazenda</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Nome da empresa ou fazenda aquícola"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialties">Especialidades</Label>
                <Input
                  id="specialties"
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleChange}
                  placeholder="Ex: Cultivo de ostras, mexilhões..."
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3 flex-shrink-0">
          <p className="text-sm text-muted-foreground">
            * Campos obrigatórios • Senha: 6 primeiros dígitos do CPF
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg rounded-xl px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
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

