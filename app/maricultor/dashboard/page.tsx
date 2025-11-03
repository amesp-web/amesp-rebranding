"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { LogOut, User, Settings, Fish, Calendar, FileText, Lock, DollarSign, Waves, Activity, Eye, ArrowUpRight, MapPin } from "lucide-react"

export default function MaricultorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [news, setNews] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)

      if (user?.id) {
        // Carregar perfil do maricultor
        const { data: p, error: pErr } = await supabase
          .from('maricultor_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (pErr) {
          console.warn('maricultor_profiles select error:', pErr)
        }
        const parseStreetNumber = (value?: string) => {
          if (!value) return { street: '', number: '' }
          const trimmed = String(value).trim()
          // captura padrões: ", 123", " 123", "nº 123", "no 123", "N 123A"
          const m = trimmed.match(/^(.*?)[,\s-]*(?:n\s*[ºo]?\s*)?(\d+[A-Za-z]?)\s*$/i)
          if (!m) return { street: trimmed, number: '' }
          const street = m[1].trim()
          const number = m[2].trim()
          return { street, number }
        }

        const { street, number } = parseStreetNumber(p?.logradouro)
        setProfile({
          ...p,
          logradouro: street,
          numero: number,
          cep: p?.cep || '',
        } as any)
      }
    }

    getUser()
  }, [supabase.auth])

  useEffect(() => {
    // Buscar notícias publicadas
    async function fetchNews() {
      try {
        const { data } = await supabase
          .from('news')
          .select('id, title, excerpt, created_at, image_url')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(3)
        setNews(data || [])
      } catch (error) {
        console.error('Erro ao buscar notícias:', error)
      }
    }

    // Buscar eventos publicados
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, title, location, schedule')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(2)
        
        console.log('📅 Eventos buscados:', data)
        console.log('❌ Erro ao buscar eventos:', error)
        
        setEvents(data || [])
      } catch (error) {
        console.error('❌ Erro ao buscar eventos:', error)
      }
    }

    fetchNews()
    fetchEvents()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (days > 0) return `Há ${days} dia${days > 1 ? 's' : ''}`
    if (hours > 0) return `Há ${hours} hora${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`
    return 'Agora mesmo'
  }

  const profileCompletion = useMemo(() => {
    if (!profile) return 0
    
    // Apenas campos visíveis no formulário de edição
    const fields = [
      profile.full_name,      // Nome completo
      profile.contact_phone,  // Telefone
      profile.cep,            // CEP
      profile.logradouro,     // Logradouro
      profile.numero,         // Número
      profile.cidade,         // Cidade
      profile.estado,         // UF
      profile.company,        // Empresa/Fazenda
      profile.specialties     // Especialidades
    ]
    
    const filledFields = fields.filter(field => field !== null && field !== undefined && field !== '').length
    const totalFields = fields.length
    
    return Math.round((filledFields / totalFields) * 100)
  }, [profile])

  const handleSaveProfile = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      // Delegamos ao backend para geocodificar (mesma lógica do cadastro)
      const resp = await fetch('/api/maricultor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          full_name: profile?.full_name || user.user_metadata?.name || '',
          phone: profile?.contact_phone || null,
          logradouro: [profile?.logradouro, profile?.numero].filter(Boolean).join(', '),
          cidade: profile?.cidade || null,
          estado: profile?.estado || null,
          cep: String(profile?.cep || '').replace(/\D/g, ''),
          company: profile?.company || null,
          specialties: profile?.specialties || null,
          latitude: null,
          longitude: null,
        })
      })
      if (resp.ok) {
        setEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCepChange = async (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    const masked = digits.replace(/(\d{5})(\d{1,3})?/, (_, a: string, b?: string) => (b ? `${a}-${b}` : a))
    setProfile((p: any) => ({ ...p, cep: masked }))
    if (digits.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { cache: 'no-store' })
      const data = await res.json()
      if (data?.erro) return
      setProfile((p: any) => ({
        ...p,
        logradouro: data.logradouro || p?.logradouro || '',
        cidade: data.localidade || p?.cidade || '',
        estado: data.uf || p?.estado || '',
      }))
    } catch {}
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12] flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-bold mb-4">Acesso Negado</h2>
            <p className="text-muted-foreground mb-6">Você precisa fazer login para acessar esta área.</p>
            <Button asChild>
              <Link href="/maricultor/login">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/amesp_logo.png" alt="AMESP" width={120} height={40} className="h-10 w-auto" />
            </Link>
            <Badge variant="secondary">Área do Maricultor</Badge>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Olá, {profile?.full_name || user.user_metadata?.name || user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Header - Gradiente Oceânico */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 border-0 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Fish className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">Bem-vindo, {profile?.full_name || user.user_metadata?.name || 'Maricultor'}!</h1>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    Produtor
                  </Badge>
                </div>
                <p className="text-white/90 mt-1">Gerencie suas atividades de maricultura e acompanhe as novidades do setor</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-white/80 text-sm">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Sistema operacional</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{profile?.cidade || 'Localização'} - {profile?.estado || 'UF'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - Perfil */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-md">
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-blue-50 via-cyan-50/50 to-teal-50/30 border-blue-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completude do Perfil</CardTitle>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors flex items-center justify-center shadow-md">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-primary">{profileCompletion}%</span>
                <ArrowUpRight className="h-4 w-4 text-primary/60" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                {profileCompletion < 100 ? (
                  <p className="text-xs text-muted-foreground">Complete seu perfil para aparecer no mapa</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Perfil completo</p>
                )}
                <Badge variant="secondary" className={`text-xs ${profileCompletion === 100 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                  {profileCompletion === 100 ? 'Completo' : 'Incompleto'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent News */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2 text-xl">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <span>Últimas Notícias</span>
                    </CardTitle>
                    <CardDescription className="mt-1">Fique por dentro das novidades do setor</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {news.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma notícia publicada ainda</p>
                ) : (
                  news.map((item, idx) => {
                    const timeAgo = item.created_at ? formatTimeAgo(new Date(item.created_at)) : ''
                    return (
                      <div key={item.id} className={`border-l-4 ${idx === 0 ? 'border-primary' : 'border-accent'} pl-4`}>
                        <h4 className="font-semibold line-clamp-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt || 'Sem descrição disponível'}</p>
                        {timeAgo && <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>}
                      </div>
                    )
                  })
                )}
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href="/news">Ver Todas as Notícias</a>
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 via-pink-50/30 to-white">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2 text-xl">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <span>Próximos Eventos</span>
                    </CardTitle>
                    <CardDescription className="mt-1">Eventos e workshops para maricultores</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento publicado ainda</p>
                ) : (
                  events.map((event) => {
                    console.log('🎯 Renderizando evento:', event)
                    console.log('📋 Schedule:', event.schedule)
                    
                    // Tratar schedule que pode ser objeto ou array
                    let firstDate = null
                    if (event.schedule) {
                      if (typeof event.schedule === 'string') {
                        try {
                          const parsed = JSON.parse(event.schedule)
                          firstDate = parsed?.date || parsed?.[0]?.date || parsed?.attractions?.[0]?.date
                        } catch {
                          firstDate = null
                        }
                      } else if (Array.isArray(event.schedule)) {
                        firstDate = event.schedule[0]?.date
                      } else if (typeof event.schedule === 'object') {
                        firstDate = event.schedule.date || event.schedule.attractions?.[0]?.date
                      }
                    }
                    
                    const eventDate = firstDate ? new Date(firstDate + 'T00:00:00') : null
                    const day = eventDate ? eventDate.getDate() : '?'
                    const month = eventDate ? eventDate.toLocaleString('pt-BR', { month: 'short' }).toUpperCase() : '?'
                    
                    return (
                      <div key={event.id} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50">
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{day}</div>
                          <div className="text-xs text-muted-foreground">{month}</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold line-clamp-1">{event.title}</h4>
                          {event.location && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{event.location}</p>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href="/#eventos">Ver Todos os Eventos</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-white">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-emerald-600" />
                  </div>
                  <CardTitle>Meu Perfil</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editing ? (
                  <>
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Fish className="h-8 w-8 text-primary" />
                      </div>
                  <h3 className="font-semibold">{profile?.full_name || user.user_metadata?.name || "Maricultor"}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {(profile?.company || user.user_metadata?.company) && (
                        <p className="text-sm text-muted-foreground">{profile?.company || user.user_metadata?.company}</p>
                      )}
                    </div>
                    <Button variant="outline" className="w-full bg-transparent" onClick={() => setEditing(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground">CEP</label>
                        <input
                          className="mt-1 w-full px-3 py-2 rounded-md bg-white border border-border"
                          value={profile?.cep || ''}
                          onChange={(e) => handleCepChange(e.target.value)}
                          placeholder="00000-000"
                          inputMode="numeric"
                          maxLength={9}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Nome completo</label>
                        <input
                          className="mt-1 w-full px-3 py-2 rounded-md bg-white border border-border"
                          value={profile?.full_name || ''}
                          onChange={(e) => setProfile((p: any) => ({ ...p, full_name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Telefone</label>
                        <input
                          className="mt-1 w-full px-3 py-2 rounded-md bg-white border border-border"
                          value={profile?.contact_phone || ''}
                          onChange={(e) => setProfile((p: any) => ({ ...p, contact_phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Logradouro</label>
                        <input
                          className="mt-1 w-full px-3 py-2 rounded-md bg-white border border-border"
                          value={profile?.logradouro || ''}
                          onChange={(e) => setProfile((p: any) => ({ ...p, logradouro: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Número</label>
                        <input
                          className="mt-1 w-full px-3 py-2 rounded-md bg-white border border-border"
                          value={profile?.numero || ''}
                          onChange={(e) => setProfile((p: any) => ({ ...p, numero: e.target.value }))}
                          inputMode="numeric"
                          placeholder="nº"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">Cidade</label>
                          <input
                            className="mt-1 w-full px-3 py-2 rounded-md bg-white border border-border"
                            value={profile?.cidade || ''}
                            onChange={(e) => setProfile((p: any) => ({ ...p, cidade: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">UF</label>
                          <input
                            className="mt-1 w-full px-3 py-2 rounded-md bg-white border border-border"
                            value={profile?.estado || ''}
                            onChange={(e) => setProfile((p: any) => ({ ...p, estado: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Empresa/Fazenda</label>
                        <input
                          className="mt-1 w-full px-3 py-2 rounded-md bg-white border border-border"
                          value={profile?.company || ''}
                          onChange={(e) => setProfile((p: any) => ({ ...p, company: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Especialidades</label>
                        <textarea
                          className="mt-1 w-full px-3 py-2 rounded-md bg-white border border-border h-20"
                          value={profile?.specialties || ''}
                          onChange={(e) => setProfile((p: any) => ({ ...p, specialties: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="bg-transparent" onClick={() => setEditing(false)} disabled={saving}>Cancelar</Button>
                      <Button onClick={handleSaveProfile} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Mensalidades */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-amber-50 via-orange-50/30 to-white">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Mensalidades
                    </CardTitle>
                    <CardDescription className="mt-1">Gerencie suas mensalidades e pagamentos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Lock className="h-8 w-8 text-primary/60" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Em Breve</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Funcionalidade de gerenciamento de mensalidades estará disponível em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
