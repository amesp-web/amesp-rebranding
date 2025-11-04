"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Mail, Search, Download, Users, TrendingUp, Calendar, Phone, Building2, ToggleLeft, ToggleRight, FileText } from "lucide-react"
import { toast } from "sonner"
import { FishLoading } from "@/components/ui/fish-loading"

interface Subscriber {
  id: string
  email: string
  name: string | null
  phone: string | null
  company: string | null
  subscribed_at: string
  is_active: boolean
  unsubscribed_at: string | null
  source: string
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [stats, setStats] = useState({ total: 0, active: 0 })

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/admin/newsletter')
      const result = await response.json()

      if (result.success) {
        setSubscribers(result.data || [])
        setStats({ total: result.total || 0, active: result.active || 0 })
      } else {
        toast.error('Erro ao carregar inscritos')
      }
    } catch (error) {
      console.error('Erro ao buscar inscritos:', error)
      toast.error('Erro ao carregar inscritos')
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/newsletter', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(!currentStatus ? 'Inscrito ativado' : 'Inscrito desativado')
        fetchSubscribers()
      } else {
        toast.error('Erro ao atualizar inscrito')
      }
    } catch (error) {
      toast.error('Erro ao atualizar inscrito')
    }
  }

  const exportToCSV = () => {
    const csv = [
      ['Nome', 'Email', 'Telefone', 'Empresa', 'Data Inscrição', 'Status', 'Origem'],
      ...subscribers.map(s => [
        s.name || '',
        s.email,
        s.phone || '',
        s.company || '',
        new Date(s.subscribed_at).toLocaleDateString('pt-BR'),
        s.is_active ? 'Ativo' : 'Inativo',
        s.source
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `newsletter-inscritos-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Lista exportada com sucesso!')
  }

  const filteredSubscribers = subscribers.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.company?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <FishLoading size="lg" text="Carregando inscritos da newsletter..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Moderno com Gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Newsletter</h1>
              <p className="text-white/90">Gerencie os inscritos que desejam receber atualizações sobre maricultura</p>
            </div>
          </div>
          <Button 
            onClick={exportToCSV}
            className="rounded-xl px-6 bg-white text-blue-700 hover:bg-white/90 shadow-lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-blue-50 via-cyan-50/50 to-blue-50/30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Inscritos</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 group-hover:from-blue-500/30 group-hover:to-blue-500/20 transition-colors flex items-center justify-center shadow-md">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-blue-600">{stats.total}</span>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-xs text-muted-foreground">Todos os registros</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-green-50 via-emerald-50/50 to-green-50/30">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 group-hover:from-green-500/30 group-hover:to-green-500/20 transition-colors flex items-center justify-center shadow-md">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-green-600">{stats.active}</span>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-xs text-muted-foreground">Recebendo newsletters</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-purple-50 via-pink-50/50 to-purple-50/30">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Ativação</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 group-hover:from-purple-500/30 group-hover:to-purple-500/20 transition-colors flex items-center justify-center shadow-md">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-purple-600">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
              </span>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-xs text-muted-foreground">Inscritos ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Inscritos */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/20 to-cyan-50/10 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-blue-100/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">
                  Inscritos ({filteredSubscribers.length})
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Lista de pessoas que desejam receber newsletters
                </CardDescription>
              </div>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-blue-200/50 focus:border-blue-300"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 rounded-2xl border-2 border-dashed border-blue-200">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-base font-medium text-slate-600 mb-2">
                {search ? 'Nenhum inscrito encontrado' : 'Nenhum inscrito na newsletter ainda'}
              </p>
              {search && (
                <p className="text-sm text-muted-foreground">
                  Tente buscar com outros termos
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubscribers.map((subscriber) => (
                <div
                  key={subscriber.id}
                  className="group relative overflow-hidden flex items-center justify-between p-5 border-2 border-blue-100/50 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-white to-blue-50/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex-1 relative z-10">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-slate-800">
                        {subscriber.name || 'Sem nome'}
                      </h3>
                      <Badge 
                        variant={subscriber.is_active ? "default" : "secondary"} 
                        className={`text-xs font-semibold ${
                          subscriber.is_active 
                            ? 'bg-green-100 text-green-700 border-green-300' 
                            : 'bg-gray-100 text-gray-600 border-gray-300'
                        }`}
                      >
                        {subscriber.is_active ? '✓ Ativo' : '✗ Inativo'}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700 inline-flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{subscriber.source === 'contact_form' ? 'Formulário' : subscriber.source}</span>
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <Mail className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-medium">{subscriber.email}</span>
                      </div>
                      {subscriber.phone && (
                        <div className="flex items-center space-x-1.5">
                          <Phone className="h-3.5 w-3.5 text-teal-500" />
                          <span>{subscriber.phone}</span>
                        </div>
                      )}
                      {subscriber.company && (
                        <div className="flex items-center space-x-1.5">
                          <Building2 className="h-3.5 w-3.5 text-cyan-500" />
                          <span>{subscriber.company}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-purple-500" />
                        <span>{new Date(subscriber.subscribed_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(subscriber.id, subscriber.is_active)}
                    className="relative z-10 hover:bg-blue-50"
                  >
                    {subscriber.is_active ? (
                      <ToggleRight className="h-6 w-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-slate-400" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

