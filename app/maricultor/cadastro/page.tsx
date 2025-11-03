"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { UserPlus, Mail, Lock, User, Phone, MapPin, ArrowLeft, Fish, Eye, EyeOff } from "lucide-react"

export default function MaricultorCadastroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    cep: "",
    location: "",
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
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const getSupabaseClient = () => {
    try {
      return createClient()
    } catch (err) {
      setError("Erro de configuração. Tente novamente mais tarde.")
      return null
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // Buscar endereço pelo CEP (ViaCEP) e travar endereço (geocodificação no backend)
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
      console.log('🔍 Buscando CEP:', onlyDigits)
      
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
          console.log('📦 Resposta ViaCEP:', dataViaCep)
          
          if (!dataViaCep?.erro) {
            logradouro = dataViaCep.logradouro || ''
            cidade = dataViaCep.localidade || ''
            estado = dataViaCep.uf || ''
            encontrado = true
            console.log('✅ CEP encontrado no ViaCEP')
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
            console.log('📦 Resposta BrasilAPI:', dataBrasilAPI)
            
            logradouro = dataBrasilAPI.street || ''
            cidade = dataBrasilAPI.city || ''
            estado = dataBrasilAPI.state || ''
            encontrado = true
            console.log('✅ CEP encontrado no BrasilAPI')
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
        console.log('⚠️ CEP genérico encontrado (sem logradouro). Cidade/Estado preenchidos.')
        return
      }
      
      // Sucesso completo
      setFormData((prev) => ({ ...prev, logradouro, cidade, estado }))
      setAddressLocked(true)
      setSuggestions([])
      setShowSuggestions(false)
      console.log('✅ Endereço completo preenchido via CEP:', { logradouro, cidade, estado })
      
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
        // Adiciona contexto se o usuário já informou cidade/UF para melhorar a assertividade
        const hasCidade = Boolean(formData.cidade && formData.cidade.trim())
        const hasEstado = Boolean(formData.estado && formData.estado.trim())
        if (hasCidade) queryParts.push(formData.cidade)
        if (hasEstado) queryParts.push(formData.estado)
        const q = encodeURIComponent(queryParts.join(', '))
        // Filtros: Brasil + UF + Cidade quando disponíveis
        const filters: string[] = ['countrycode:br']
        if (hasEstado) filters.push(`statecode:${encodeURIComponent(formData.estado)}`)
        if (hasCidade) filters.push(`place:${encodeURIComponent(formData.cidade)}`)
        const filterParam = filters.join(',')
        // Bias por cidade ajuda a ranquear melhor nos primeiros caracteres
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
  }, [formData.logradouro, formData.cidade, formData.estado])

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
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            location: formData.location,
            company: formData.company,
            specialties: formData.specialties,
            user_type: "maricultor",
          },
        },
      })

      if (error) {
        setError(error.message)
      } else {
        // Persistir perfil do maricultor
        const userId = data.user?.id
        if (userId) {
          try {
            const resp = await fetch('/api/maricultor/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: userId,
                full_name: formData.name,
                phone: formData.phone,
                logradouro: [formData.logradouro, formData.numero].filter(Boolean).join(', '),
                cidade: formData.cidade,
                estado: formData.estado,
                cep: formData.cep.replace(/\D/g, ''),
                company: formData.company,
                specialties: formData.specialties,
                latitude: addressLocked ? null : coords.latitude,
                longitude: addressLocked ? null : coords.longitude,
              })
            })
            if (!resp.ok) {
              const payload = await resp.json().catch(() => ({}))
              setError(payload?.error || 'Falha ao salvar perfil de maricultor')
              setLoading(false)
              return
            }

            // Confirma e-mail automaticamente (para evitar bloqueio no primeiro login)
            try {
              await fetch('/api/auth/confirm-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
              })
            } catch {}
          } catch (e) {
            setError('Falha na comunicação com o servidor ao salvar o perfil')
            setLoading(false)
            return
          }
        }
        setSuccess(true)
        // Redireciona para login unificado após breve confirmação
        setTimeout(() => {
          router.push('/login?success=maricultor_registered')
        }, 1200)
      }
    } catch (err) {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
          <CardContent className="text-center p-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Cadastro realizado!</h2>
            <p className="text-muted-foreground mb-6">Redirecionando para a página de login...</p>
            <Button asChild className="w-full">
              <Link href="/login">Ir para Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao site</span>
          </Link>
          <div className="flex justify-center mb-4">
            <Image src="/amesp_logo.png" alt="AMESP" width={120} height={40} className="h-12 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Cadastro de Maricultor</h1>
          <p className="text-muted-foreground">Junte-se à nossa comunidade de maricultores</p>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Fish className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Criar Conta</CardTitle>
                <CardDescription>Preencha seus dados para se cadastrar</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Nome Completo *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">E-mail *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border-0 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {formData.password && formData.password.length < 6 && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <span>⚠️</span>
                      A senha deve ter no mínimo 6 caracteres
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Confirmar Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60 ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword 
                          ? 'border-red-300 focus:ring-red-200' 
                          : formData.confirmPassword && formData.password === formData.confirmPassword
                          ? 'border-green-300 focus:ring-green-200'
                          : 'border-transparent'
                      }`}
                      placeholder="Repita sua senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span>✗</span>
                      As senhas não coincidem
                    </p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length >= 6 && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span>✓</span>
                      As senhas coincidem!
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                {/* CEP ao lado do telefone */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">CEP</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cep"
                      inputMode="numeric"
                      value={formData.cep}
                      onChange={handleCepChange}
                      maxLength={9}
                      className={`w-full px-4 py-3 border-2 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60 ${
                        cepError ? 'border-red-300 focus:ring-red-200' : 'border-transparent'
                      } ${cepLoading ? 'opacity-70' : ''}`}
                      placeholder="Ex: 01001-000"
                      disabled={cepLoading}
                    />
                    {cepLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
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
              </div>

              {/* Logradouro + número com autocomplete (Geoapify) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Logradouro</label>
                <div className="grid grid-cols-12 gap-3 relative">
                  <div className="col-span-9 md:col-span-10 relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      name="logradouro"
                      value={formData.logradouro}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60 ${
                        !formData.cep || formData.cep.length < 9 ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                      placeholder={!formData.cep || formData.cep.length < 9 ? "Preencha o CEP primeiro" : "Rua e complemento"}
                      ref={logradouroRef}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      disabled={!formData.cep || formData.cep.length < 9 || addressLocked}
                      readOnly={addressLocked}
                    />
                    {/* Dica opcional removida: Geoapify funciona mesmo sem cidade/UF */}
                    {showSuggestions && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-border rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Nenhuma sugestão encontrada</div>
                    ) : suggestions.map((item, idx) => {
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
                  <div className="col-span-3 md:col-span-2">
                    <label className="sr-only">Número</label>
                    <input
                      type="text"
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-0 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60 ${
                        !formData.cep || formData.cep.length < 9 ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                      placeholder={!formData.cep || formData.cep.length < 9 ? "CEP primeiro" : "nº"}
                      inputMode="numeric"
                      disabled={!formData.cep || formData.cep.length < 9}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Cidade</label>
                  <input
                    type="text"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-0 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60 ${
                      !formData.cep || formData.cep.length < 9 ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    placeholder={!formData.cep || formData.cep.length < 9 ? "Preencha o CEP primeiro" : "Ex: Ubatuba"}
                    disabled={!formData.cep || formData.cep.length < 9}
                    readOnly={formData.cidade && (formData.cep.length === 9)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Estado (UF)</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border-0 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-foreground ${
                      !formData.cep || formData.cep.length < 9 ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    disabled={!formData.cep || formData.cep.length < 9 || (formData.estado && formData.cep.length === 9)}
                  >
                    <option value="" disabled>Selecione</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Empresa/Fazenda</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-0 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                  placeholder="Nome da sua empresa ou fazenda aquícola"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Especialidades</label>
                <textarea
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-0 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all h-24 resize-none placeholder:text-muted-foreground/60"
                  placeholder="Ex: Cultivo de ostras, mexilhões, vieiras..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="terms" className="rounded border-border" required />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  Concordo com os{" "}
                  <Link href="/termos" className="text-primary hover:text-primary/80">
                    termos de uso
                  </Link>{" "}
                  e{" "}
                  <Link href="/privacidade" className="text-primary hover:text-primary/80">
                    política de privacidade
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-base font-semibold hover:scale-[1.02] transition-transform shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Criando conta...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Criar Conta</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link
                  href="/maricultor/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Faça login aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
