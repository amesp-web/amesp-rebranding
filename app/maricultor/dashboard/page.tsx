"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { LogOut, User, Settings, Fish, Calendar, FileText, BarChart3, Bell } from "lucide-react"

export default function MaricultorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

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

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo, {profile?.full_name || user.user_metadata?.name || user.email}!</h1>
          <p className="text-muted-foreground">
            Gerencie suas atividades de maricultura e acompanhe as novidades do setor.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Perfil</p>
                  <p className="text-2xl font-bold text-primary">85%</p>
                </div>
                <User className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Eventos</p>
                  <p className="text-2xl font-bold text-primary">3</p>
                </div>
                <Calendar className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Notícias</p>
                  <p className="text-2xl font-bold text-primary">12</p>
                </div>
                <FileText className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Relatórios</p>
                  <p className="text-2xl font-bold text-primary">5</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent News */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Últimas Notícias</span>
                </CardTitle>
                <CardDescription>Fique por dentro das novidades do setor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">Nova Técnica de Cultivo Sustentável</h4>
                  <p className="text-sm text-muted-foreground">Pesquisadores desenvolvem método inovador...</p>
                  <p className="text-xs text-muted-foreground mt-1">Há 2 dias</p>
                </div>
                <div className="border-l-4 border-accent pl-4">
                  <h4 className="font-semibold">Workshop Nacional de Maricultura</h4>
                  <p className="text-sm text-muted-foreground">Evento reúne 200 especialistas...</p>
                  <p className="text-xs text-muted-foreground mt-1">Há 5 dias</p>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Todas as Notícias
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Próximos Eventos</span>
                </CardTitle>
                <CardDescription>Eventos e workshops para maricultores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">15</div>
                    <div className="text-xs text-muted-foreground">DEZ</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Curso de Certificação</h4>
                    <p className="text-sm text-muted-foreground">Certificação internacional para produtores</p>
                    <Badge variant="outline" className="mt-1">
                      Presencial
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Todos os Eventos
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Meu Perfil</span>
                </CardTitle>
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

            {/* Quick Actions */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  Relatório de Produção
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Visita Técnica
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Bell className="h-4 w-4 mr-2" />
                  Configurar Alertas
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Análise de Dados
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
