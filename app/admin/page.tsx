import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { Newspaper, Users, Camera, MapPin, Eye, TrendingUp, Calendar, Waves, Activity, ArrowUpRight, DollarSign, Lock } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Otimizar queries com Promise.all para carregamento paralelo
  const [
    newsCountResult,
    producersCountResult, 
    galleryCountResult,
    publishedNewsCountResult,
    recentNewsResult,
    viewsDataResult
  ] = await Promise.all([
    supabase.from("news").select("id", { count: "exact" }),
    supabase.from("maricultor_profiles").select("id", { count: "exact" }).eq("is_active", true),
    supabase.from("gallery").select("id", { count: "exact" }),
    supabase.from("news").select("id", { count: "exact" }).eq("published", true),
    supabase.from("news").select("id, title, created_at, published, views").order("created_at", { ascending: false }).limit(5),
    supabase.from("news").select("views")
  ])

  // Extrair dados dos resultados
  const newsCount = newsCountResult.count || 0
  const producersCount = producersCountResult.count || 0
  const galleryCount = galleryCountResult.count || 0
  const publishedNewsCount = publishedNewsCountResult.count || 0
  const recentNews = recentNewsResult.data || []
  const viewsData = viewsDataResult.data || []

  const totalViews = viewsData.reduce((sum, item) => sum + (item.views || 0), 0)

  return (
    <div className="space-y-8">
      {/* Hero Header - Gradiente Oceânico */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 border-0 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Waves className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-4xl font-bold text-white">Dashboard Administrativo</h1>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  AMESP
                </Badge>
              </div>
              <p className="text-white/90 mt-1">Gerencie o conteúdo do site da AMESP</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-white/80 text-sm">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Sistema operacional</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>{totalViews.toLocaleString()} visualizações totais</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Redesigned */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Notícias Card */}
        <Link href="/admin/news">
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-blue-50 via-cyan-50/50 to-teal-50/30 border-blue-200/50 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Notícias</CardTitle>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors flex items-center justify-center shadow-md">
                  <Newspaper className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-primary">{newsCount}</span>
                <ArrowUpRight className="h-4 w-4 text-primary/60" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{publishedNewsCount} publicadas</p>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                  Ativas
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Produtores Card */}
        <Link href="/admin/producers">
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-teal-50 via-cyan-50/50 to-blue-50/30 border-teal-200/50 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Produtores</CardTitle>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 group-hover:from-accent/30 group-hover:to-accent/20 transition-colors flex items-center justify-center shadow-md">
                  <Users className="h-5 w-5 text-accent" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-accent">{producersCount}</span>
                <ArrowUpRight className="h-4 w-4 text-accent/60" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Associados ativos</p>
                <Badge variant="secondary" className="text-xs bg-accent/10 text-accent border-accent/20">
                  Maricultores
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Galeria Card */}
        <Link href="/admin/gallery">
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-cyan-50 via-blue-50/50 to-teal-50/30 border-cyan-200/50 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Galeria</CardTitle>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors flex items-center justify-center shadow-md">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-primary">{galleryCount}</span>
                <ArrowUpRight className="h-4 w-4 text-primary/60" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Imagens cadastradas</p>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                  Fotos
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Visualizações Card */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-indigo-50 via-cyan-50/50 to-blue-50/30 border-indigo-200/50 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Visualizações</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 group-hover:from-accent/30 group-hover:to-accent/20 transition-colors flex items-center justify-center shadow-md">
                <Eye className="h-5 w-5 text-accent" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-accent">{totalViews.toLocaleString()}</span>
              <TrendingUp className="h-4 w-4 text-accent/60" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total de views</p>
              <Badge variant="secondary" className="text-xs bg-accent/10 text-accent border-accent/20">
                Engajamento
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notícias Recentes */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/20 to-cyan-50/10 backdrop-blur-sm">
          <CardHeader className="pb-4 border-b border-blue-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">Notícias Recentes</CardTitle>
                  <CardDescription className="text-slate-600">Últimas notícias adicionadas ao sistema</CardDescription>
                </div>
              </div>
              <Link href="/admin/news" className="px-4 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors border border-blue-200/50">
                Ver todas →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {recentNews?.map((news) => (
                <div 
                  key={news.id} 
                  className="group relative overflow-hidden flex items-center justify-between p-4 border-2 border-blue-100/50 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-white to-blue-50/30 cursor-pointer"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${news.published ? 'bg-green-100' : 'bg-orange-100'}`}>
                      {news.published ? (
                        <Newspaper className="h-5 w-5 text-green-600" />
                      ) : (
                        <Calendar className="h-5 w-5 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge 
                          variant={news.published ? "default" : "secondary"} 
                          className={`text-xs font-semibold ${news.published ? 'bg-green-100 text-green-700 border-green-300' : 'bg-orange-100 text-orange-700 border-orange-300'}`}
                        >
                          {news.published ? "✓ Publicada" : "⏱ Rascunho"}
                        </Badge>
                      </div>
                      <p className="font-semibold text-sm text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{news.title}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(news.created_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span className="font-medium">{news.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!recentNews || recentNews.length === 0) && (
                <div className="text-center py-12 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 rounded-2xl border-2 border-dashed border-blue-200">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-4">
                    <Newspaper className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-base font-medium text-slate-600 mb-2">Nenhuma notícia encontrada</p>
                  <Link 
                    href="/admin/news/new" 
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 transition-all duration-300 mt-3 border border-blue-200"
                  >
                    Criar primeira notícia →
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Módulo Financeiro */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-amber-50 via-orange-50/30 to-white">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Módulo Financeiro
                </CardTitle>
                <CardDescription className="mt-1">Gestão financeira e relatórios</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Lock className="h-8 w-8 text-primary/60" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Em Breve</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Funcionalidade de gestão financeira estará disponível em breve.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}