import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Newspaper, Users, Camera, MapPin, Eye, TrendingUp, Calendar, Award } from "lucide-react"

export default function DevAdminDashboard() {
  // Dados mockados para desenvolvimento
  const mockStats = {
    newsCount: 5,
    publishedNewsCount: 3,
    producersCount: 8,
    galleryCount: 12,
    totalViews: 1250
  }

  const mockRecentNews = [
    {
      id: 1,
      title: "Nova Técnica de Cultivo Sustentável",
      created_at: "2024-01-15",
      published: true,
      views: 450
    },
    {
      id: 2,
      title: "Workshop Nacional da Maricultura",
      created_at: "2024-01-10",
      published: true,
      views: 320
    },
    {
      id: 3,
      title: "Certificação Internacional",
      created_at: "2024-01-05",
      published: false,
      views: 0
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header com identidade visual */}
      <div className="bg-gradient-to-r from-primary/5 via-background to-accent/5 rounded-xl p-6 border border-primary/10">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">🔧 Dashboard de Desenvolvimento</h1>
            <p className="text-muted-foreground">Gerencie o conteúdo do site da AMESP (Modo DEV)</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Notícias</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Newspaper className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockStats.newsCount}</div>
            <p className="text-xs text-muted-foreground">{mockStats.publishedNewsCount} publicadas</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtores</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{mockStats.producersCount}</div>
            <p className="text-xs text-muted-foreground">Associados ativos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Galeria</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Camera className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockStats.galleryCount}</div>
            <p className="text-xs text-muted-foreground">Imagens cadastradas</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
              <Eye className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{mockStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total de views</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Notícias Recentes
            </CardTitle>
            <CardDescription>Últimas notícias adicionadas ao sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentNews.map((news) => (
                <div key={news.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">{news.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={news.published ? "default" : "secondary"} className="text-xs">
                        {news.published ? "Publicada" : "Rascunho"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(news.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Eye className="mr-1 h-3 w-3" />
                    {news.views}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/admin/news/new"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Newspaper className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">Nova Notícia</span>
              </a>
              <a
                href="/admin/producers/new"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <MapPin className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">Novo Produtor</span>
              </a>
              <a
                href="/admin/gallery/new"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Camera className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">Nova Imagem</span>
              </a>
              <a
                href="/admin/news"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">Ver Todas</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aviso de desenvolvimento */}
      <Card className="border border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full bg-yellow-400"></div>
            <span className="text-sm font-medium text-yellow-800">Modo de Desenvolvimento</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Este é um dashboard de desenvolvimento. Os dados são mockados e não refletem o banco de dados real.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

