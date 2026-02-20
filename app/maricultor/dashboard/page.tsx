"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { LogOut, User, Fish, Calendar, FileText, Lock, DollarSign, Waves, Activity, Eye, ArrowUpRight, MapPin, ExternalLink, FolderOpen, ScrollText, Phone, Building2, Newspaper, Share2 } from "lucide-react"

// Função para calcular a próxima reunião (primeira segunda-feira do mês, exceto dez/jan/fev)
function getNextMeeting() {
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() // 0-11

  // Função para encontrar a primeira segunda-feira de um mês
  const getFirstMonday = (y: number, m: number) => {
    const firstDay = new Date(y, m, 1)
    const dayOfWeek = firstDay.getDay() // 0=domingo, 1=segunda
    const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : (8 - dayOfWeek)
    return new Date(y, m, 1 + daysUntilMonday)
  }

  // Verificar mês atual
  while (true) {
    // Pular dezembro (11), janeiro (0) e fevereiro (1)
    if (month === 11 || month === 0 || month === 1) {
      month++
      if (month > 11) {
        month = 0
        year++
      }
      continue
    }

    const firstMonday = getFirstMonday(year, month)
    
    // Se a reunião já passou, ir para o próximo mês
    if (firstMonday < now) {
      month++
      if (month > 11) {
        month = 0
        year++
      }
      continue
    }

    // Encontrou a próxima reunião
    return firstMonday
  }
}

export default function MaricultorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [news, setNews] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  
  // Calcular próxima reunião
  const nextMeeting = useMemo(() => getNextMeeting(), [])

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
    try {
      await supabase.auth.signOut()
      
      // Limpar qualquer estado/cache do navegador
      if (typeof window !== 'undefined') {
        // Limpar localStorage relacionado ao Supabase
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase')) {
            localStorage.removeItem(key)
          }
        })
      }
      
      // Aguardar um pouco para garantir que a sessão foi limpa
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Redirecionar para login
      window.location.href = '/login'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Mesmo com erro, tentar redirecionar
      window.location.href = '/login'
    }
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

        {/* Quick Stats - Perfil e Próxima Reunião */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-blue-50 via-cyan-50/50 to-teal-50/30 border-blue-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
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

          {/* Card Próxima Reunião */}
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-purple-50 via-pink-50/50 to-orange-50/30">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Próxima Reunião</CardTitle>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 group-hover:from-purple-500/30 group-hover:to-pink-500/20 transition-colors flex items-center justify-center shadow-md">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-purple-600">
                  {nextMeeting.toLocaleDateString('pt-BR', { day: '2-digit' })}
                </span>
                <span className="text-lg font-semibold text-purple-600/80">
                  {nextMeeting.toLocaleDateString('pt-BR', { month: 'short' })}
                </span>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Primeira segunda-feira do mês
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                    {nextMeeting.toLocaleDateString('pt-BR', { weekday: 'long' })}
                  </Badge>
                  <span className="text-muted-foreground">
                    {nextMeeting.toLocaleDateString('pt-BR', { year: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  📍 Sede AMESP • 19h
                </p>
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
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
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
                <Button variant="outline" className="w-full bg-transparent hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors" asChild>
                  <a href="/news" target="_blank" rel="noopener noreferrer">Ver Todas as Notícias</a>
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 via-pink-50/30 to-white">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
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
                <Button variant="outline" className="w-full bg-transparent hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-colors" asChild>
                  <a href="/#eventos" target="_blank" rel="noopener noreferrer">Ver Todos os Eventos</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-white">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-emerald-600" />
                  </div>
                  <CardTitle>Meu Perfil</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="text-center">
                  {profile?.logo_path ? (
                    <div className="h-16 w-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-emerald-200 bg-white flex items-center justify-center">
                      <img
                        src={`/api/public/maricultor-logo?path=${encodeURIComponent(profile.logo_path)}`}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Fish className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <h3 className="font-semibold">{profile?.full_name || user.user_metadata?.name || "Maricultor"}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="space-y-2 pt-2 border-t border-border/60">
                  {profile?.contact_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{profile.contact_phone}</span>
                    </div>
                  )}
                  {(profile?.logradouro || profile?.cidade || profile?.cep) && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        {[
                          [profile?.logradouro, profile?.numero].filter(Boolean).join(', '),
                          profile?.cep,
                          [profile?.cidade, profile?.estado].filter(Boolean).join(' - '),
                        ].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                  )}
                  {(profile?.company || user.user_metadata?.company) && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-muted-foreground">{profile?.company || user.user_metadata?.company}</span>
                    </div>
                  )}
                  {profile?.specialties && (
                    <div className="flex items-start gap-2 text-sm">
                      <Fish className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{profile.specialties}</span>
                    </div>
                  )}
                  {profile?.birth_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        {(() => {
                          const d = String(profile.birth_date).slice(0, 10)
                          if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return profile.birth_date
                          return `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mensalidades */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-amber-50 via-orange-50/30 to-white">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
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

            {/* Atas e Documentos Institucionais */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-indigo-50 via-purple-50/30 to-white">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <FolderOpen className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Documentos AMESP
                    </CardTitle>
                    <CardDescription className="mt-1">Atas de reuniões e documentos institucionais</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 relative z-10">
                {/* Link Atas - pasta Google Drive AMESP */}
                <a
                  href="https://drive.google.com/drive/folders/1eI9mLENlJwC6T4Evn-EIw3rJ_KD17Wov?hl=pt-br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-white border border-indigo-200/50 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200 group/link shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center">
                      <ScrollText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Atas de Reuniões</p>
                      <p className="text-xs text-muted-foreground">Acesse as atas das reuniões mensais</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-indigo-600 group-hover/link:translate-x-1 transition-transform" />
                </a>

                {/* Link Documentos Institucionais - pasta Google Drive AMESP */}
                <a
                  href="https://drive.google.com/drive/folders/1NrfSFjpRPwHuSUzUXcVt9QgOeqO1fB3F?hl=pt-br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-white border border-purple-200/50 hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-200 group/link shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Documentos Institucionais</p>
                      <p className="text-xs text-muted-foreground">Estatuto, regimento e documentos oficiais</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-purple-600 group-hover/link:translate-x-1 transition-transform" />
                </a>

                {/* Link Boletim Institucional - pasta Google Drive AMESP */}
                <a
                  href="https://drive.google.com/drive/folders/1pDn1_PWaBr7EEx1Y_1gWsoUGrbXZ10Sz?hl=pt-br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-white border border-teal-200/50 hover:border-teal-400 hover:bg-teal-50/50 transition-all duration-200 group/link shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center">
                      <Newspaper className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Boletim Institucional</p>
                      <p className="text-xs text-muted-foreground">Acesse os boletins da AMESP</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-teal-600 group-hover/link:translate-x-1 transition-transform" />
                </a>

                {/* Link Documentos Colaborativos - pasta Google Drive AMESP */}
                <a
                  href="https://drive.google.com/drive/folders/1NpGbVP4Dc9v4HLfhC8GjrehAgNvpuW3O?hl=pt-br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-white border border-amber-200/50 hover:border-amber-400 hover:bg-amber-50/50 transition-all duration-200 group/link shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                      <Share2 className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Documentos Colaborativos</p>
                      <p className="text-xs text-muted-foreground">Documentos compartilhados e colaborativos</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-amber-600 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
