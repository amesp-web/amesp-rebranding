"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { UserPlus, Mail, Lock, User, Phone, MapPin, ArrowLeft, Fish } from "lucide-react"

export default function MaricultorCadastroPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    logradouro: "",
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

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

  // Autocomplete com Nominatim (OpenStreetMap) - gratuito
  useEffect(() => {
    // Requer cidade e estado para busca assertiva
    if (!formData.cidade || !formData.estado) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    if (!formData.logradouro || formData.logradouro.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(formData.logradouro)}&city=${encodeURIComponent(formData.cidade)}&state=${encodeURIComponent(formData.estado)}`, { cache: 'no-store' })
        const { results } = await res.json()
        setSuggestions(Array.isArray(results) ? results : [])
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 200)
  }, [formData.logradouro])

  const handleSelectSuggestion = (item: any) => {
    const addr = item.address || {}
    const road = addr.road || addr.pedestrian || addr.footway || addr.path
    const number = addr.house_number
    const cidade = addr.city || addr.town || addr.village || addr.municipality || formData.cidade
    const estado = addr.state || formData.estado
    const rua = [road, number].filter(Boolean).join(', ') || item.display_name

    setFormData((prev) => ({
      ...prev,
      logradouro: rua,
      cidade,
      estado,
    }))
    setCoords({ latitude: item.lat ? parseFloat(item.lat) : null, longitude: item.lon ? parseFloat(item.lon) : null })
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
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/maricultor/dashboard`,
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
            await fetch('/api/maricultor/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: userId,
                full_name: formData.name,
                phone: formData.phone,
                logradouro: formData.logradouro,
                cidade: formData.cidade,
                estado: formData.estado,
                company: formData.company,
                specialties: formData.specialties,
                latitude: coords.latitude,
                longitude: coords.longitude,
              })
            })
          } catch (e) {
            // mantém fluxo mesmo se a criação do perfil falhar; pode ser reprocessado posteriormente
          }
        }
        setSuccess(true)
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
            <h2 className="text-xl font-bold mb-2">Cadastro Realizado!</h2>
            <p className="text-muted-foreground mb-6">
              Enviamos um e-mail de confirmação para <strong>{formData.email}</strong>. Clique no link do e-mail para
              ativar sua conta.
            </p>
            <Button asChild className="w-full">
              <Link href="/maricultor/login">Ir para Login</Link>
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
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Confirmar Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                      placeholder="Repita sua senha"
                      required
                    />
                  </div>
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

                <div className="space-y-2 hidden md:block"></div>
              </div>

              {/* Logradouro em largura total com autocomplete (Nominatim) */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-foreground">Logradouro</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="logradouro"
                    value={formData.logradouro}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                    placeholder="Rua, número e complemento"
                    ref={logradouroRef}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  />
                </div>
                {!formData.cidade || !formData.estado ? (
                  <div className="text-xs text-muted-foreground">Preencha Cidade e Estado para buscar o endereço.</div>
                ) : null}
                {showSuggestions && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-border rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Nenhuma sugestão encontrada</div>
                    ) : suggestions.map((item, idx) => {
                      const addr = item.address || {}
                      const primary = [addr.road || addr.pedestrian || addr.footway || addr.path, addr.house_number]
                        .filter(Boolean)
                        .join(', ')
                      const secondary = [addr.city || addr.town || addr.village || addr.municipality, addr.state]
                        .filter(Boolean)
                        .join(' - ')
                      return (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectSuggestion(item)}
                          className="block w-full text-left px-3 py-2 hover:bg-muted/50"
                        >
                          <div className="text-sm font-medium text-foreground">{primary || item.display_name}</div>
                          {secondary && (
                            <div className="text-xs text-muted-foreground">{secondary}</div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Cidade</label>
                  <input
                    type="text"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-0 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                    placeholder="Ex: Ubatuba"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Estado (UF)</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-0 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
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
