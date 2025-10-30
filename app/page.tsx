import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import nextDynamic from "next/dynamic"
import {
  Waves,
  Heart,
  Share2,
  Calendar,
  Clock,
  Eye,
  MapPin,
  Mail,
  Phone,
  Fish,
  Users,
  Award,
  LogIn,
  UserPlus,
} from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getSupabaseData() {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    // Fetch real news data
    const { data: news } = await supabase
      .from("news")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3)

    // Buscar imagem destacada (mais recente) e mais 4 imagens comuns
    let featuredId: string | null = null
    let galleryHome: any[] = []

    const { data: featured } = await supabase
      .from("gallery")
      .select("*")
      .eq("featured", true)
      .order("updated_at", { ascending: false })
      .limit(1)

    if (featured && featured.length > 0) {
      featuredId = featured[0].id
      galleryHome.push(featured[0])
    }

    const { data: others } = await supabase
      .from("gallery")
      .select("*")
      .neq("id", featuredId || "00000000-0000-0000-0000-000000000000")
      .order("display_order", { ascending: true })
      .limit(4)

    if (others && others.length > 0) {
      galleryHome = [...galleryHome, ...others]
    }

    // Contar total de imagens para mostrar botão "Ver Galeria Completa"
    const { count: totalCount } = await supabase
      .from("gallery")
      .select("*", { count: "exact", head: true })

    const { data: producers } = await supabase
      .from("producers")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true })

    return { news, gallery: galleryHome, producers, galleryTotalCount: totalCount || 0 }
  } catch (error) {
    console.error("[v0] Failed to fetch Supabase data:", error)
    return { news: null, gallery: null, producers: null, galleryTotalCount: 0 }
  }
}

export default async function HomePage() {
  const { news, gallery, producers, galleryTotalCount } = await getSupabaseData()

  // Use real data or fallback to mock data
  const mockNews = news || [
    {
      id: 1,
      title: "Nova Técnica de Cultivo Sustentável Desenvolvida em Ubatuba",
      excerpt:
        "Pesquisadores da AMESP desenvolvem método inovador que aumenta produtividade em 40% mantendo sustentabilidade.",
      image_url: "/sustainable-aquaculture-farm-with-workers-in-boats.jpg",
      created_at: "2024-01-15",
      category: "Inovação",
      read_time: 5,
      views: 1250,
    },
    {
      id: 2,
      title: "Workshop Nacional Reúne 200 Especialistas em Maricultura",
      excerpt: "Evento histórico marca novo marco para o setor com apresentação de tecnologias revolucionárias.",
      image_url: "/professional-conference-room-with-aquaculture-expe.jpg",
      created_at: "2024-01-10",
      category: "Eventos",
      read_time: 3,
      views: 890,
    },
    {
      id: 3,
      title: "Certificação Internacional para Produtores Associados",
      excerpt: "AMESP conquista selo de qualidade internacional, beneficiando todos os produtores associados.",
      image_url: "/interactive-map-of-s-o-paulo-coast-showing-aquacul.jpg",
      created_at: "2024-01-05",
      category: "Certificação",
      read_time: 4,
      views: 2100,
    },
  ]

  const mockGallery = gallery || [
    {
      id: 1,
      image_url: "/sustainable-aquaculture-farm-with-workers-in-boats.jpg",
      title: "Cultivo Sustentável",
      description: "Fazendas aquícolas modernas",
    },
    {
      id: 2,
      image_url: "/professional-conference-room-with-aquaculture-expe.jpg",
      title: "Eventos Técnicos",
      description: "Capacitação profissional",
    },
    {
      id: 3,
      image_url: "/interactive-map-of-s-o-paulo-coast-showing-aquacul.jpg",
      title: "Mapeamento Costeiro",
      description: "Tecnologia de ponta",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/amesp_logo.png"
                alt="AMESP - Associação dos Maricultores do Estado de São Paulo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#sobre" className="text-sm font-medium hover:text-primary transition-colors">
              Sobre Nós
            </a>
            <a href="#noticias" className="text-sm font-medium hover:text-primary transition-colors">
              Notícias
            </a>
            <a href="#galeria" className="text-sm font-medium hover:text-primary transition-colors">
              Galeria
            </a>
            <a href="#produtores" className="text-sm font-medium hover:text-primary transition-colors">
              Produtores
            </a>
            <a href="#eventos" className="text-sm font-medium hover:text-primary transition-colors">
              Eventos
            </a>
            <a href="#contato" className="text-sm font-medium hover:text-primary transition-colors">
              Contato
            </a>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
              <a href="/login" className="flex items-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span>Entrar</span>
              </a>
            </Button>
            <Button size="sm" className="flex items-center space-x-2" asChild>
              <a href="/maricultor/cadastro">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Cadastrar-se</span>
                <span className="sm:hidden">Cadastro</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  Desde 1998
                </Badge>
                <h1 className="font-sans font-bold text-4xl lg:text-6xl text-balance leading-tight">
                  Associação dos Maricultores do
                  <span className="text-primary"> Estado de São Paulo</span>
                </h1>
                <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                  Trabalhamos para o desenvolvimento e organização da maricultura sustentável no litoral norte do estado
                  de São Paulo. Nossos objetivos são promover o desenvolvimento sustentável e a investigação científica.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-base">
                  Conheça Nossos Produtores
                </Button>
                <Button variant="outline" size="lg" className="text-base bg-transparent">
                  Saiba Mais
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/sustainable-aquaculture-farm-with-workers-in-boats.jpg"
                  alt="Maricultura sustentável"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card border rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Waves className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Sustentabilidade</div>
                    <div className="text-xs text-muted-foreground">100% Sustentável</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 overflow-hidden">
        {/* Camada de fundo com gradiente oceânico */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-50 via-cyan-100 to-cyan-200" />

        {/* Múltiplas camadas de ondas sobrepostas */}
        <div className="absolute inset-0">
          {/* Camada 1 - Mais clara */}
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path
              d="M0,400 C300,350 600,380 900,340 C1050,320 1150,300 1200,280 L1200,400 Z"
              fill="rgb(6 182 212 / 0.15)"
            />
          </svg>

          {/* Camada 2 */}
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path
              d="M0,400 C200,320 500,360 800,300 C950,270 1100,250 1200,230 L1200,400 Z"
              fill="rgb(6 182 212 / 0.25)"
            />
          </svg>

          {/* Camada 3 */}
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path
              d="M0,400 C250,280 550,320 850,260 C1000,230 1120,210 1200,190 L1200,400 Z"
              fill="rgb(6 182 212 / 0.35)"
            />
          </svg>

          {/* Camada 4 */}
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path
              d="M0,400 C180,240 480,290 780,220 C920,190 1080,170 1200,150 L1200,400 Z"
              fill="rgb(6 182 212 / 0.45)"
            />
          </svg>

          {/* Camada 5 - Mais escura */}
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path
              d="M0,400 C220,200 520,260 820,180 C960,150 1100,130 1200,110 L1200,400 Z"
              fill="rgb(6 182 212 / 0.55)"
            />
          </svg>

          {/* Camada final - Base */}
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path
              d="M0,400 C300,160 600,220 900,140 C1050,110 1150,90 1200,70 L1200,400 Z"
              fill="rgb(6 182 212 / 0.65)"
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-16">
            <div className="text-center group">
              <div className="font-sans font-bold text-3xl lg:text-4xl text-slate-800 mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                25+
              </div>
              <div className="text-base text-slate-700 font-medium drop-shadow-sm">Anos de Experiência</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-slate-600/40"></div>
            <div className="text-center group">
              <div className="font-sans font-bold text-3xl lg:text-4xl text-slate-800 mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                100+
              </div>
              <div className="text-base text-slate-700 font-medium drop-shadow-sm">Produtores Associados</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-slate-600/40"></div>
            <div className="text-center group">
              <div className="font-sans font-bold text-3xl lg:text-4xl text-slate-800 mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                50+
              </div>
              <div className="text-base text-slate-700 font-medium drop-shadow-sm">Projetos Realizados</div>
            </div>
          </div>
        </div>
      </section>

      <section id="noticias" className="relative py-20 bg-muted/30 overflow-hidden">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-8"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              fill="rgb(6 182 212 / 0.15)"
            ></path>
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto bg-primary/10 text-primary border-primary/20">
              Últimas Notícias
            </Badge>
            <h2 className="font-sans font-bold text-3xl lg:text-4xl text-balance">
              Acompanhe as novidades da maricultura
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Fique por dentro das últimas inovações, eventos e conquistas do setor aquícola brasileiro.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {mockNews.map((article, index) => (
              <Card
                key={article.id}
                className={`group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm ${index === 0 ? "md:col-span-2 lg:col-span-1" : ""}`}
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={article.image_url || "/placeholder.svg"}
                    alt={article.title}
                    width={600}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="secondary"
                      className="bg-primary/90 text-primary-foreground backdrop-blur-md shadow-lg border-0 font-medium"
                    >
                      {article.category}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-background/95 backdrop-blur-md rounded-full p-2 shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div className="bg-background/95 backdrop-blur-md rounded-full p-2 shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                      <Share2 className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(article.created_at).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {article.read_time}min
                    </div>
                    <div className="flex items-center">
                      <Eye className="mr-1 h-3 w-3" />
                      {article.views}
                    </div>
                  </div>
                  <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 mb-4">{article.excerpt}</CardDescription>
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-medium text-primary hover:text-primary/80 group-hover:translate-x-1 transition-transform"
                  >
                    Ler mais
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              className="hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
            >
              Ver Todas as Notícias
            </Button>
          </div>
        </div>
      </section>

      <section id="galeria" className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-8"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M598.97 114.72L0 0 0 120 1200 120 1200 0 598.97 114.72z" fill="rgb(248 250 252 / 0.3)"></path>
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="w-fit mx-auto">
              Galeria Visual
            </Badge>
            <h2 className="font-sans font-bold text-3xl lg:text-4xl text-balance">
              Conheça nosso trabalho através de imagens
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Uma jornada visual pela maricultura sustentável no litoral norte de São Paulo.
            </p>
          </div>

          {gallery && gallery.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {(() => {
                // Reordenar: imagens destacadas primeiro, depois as demais mantendo display_order
                const sortedGallery = [...gallery].sort((a: any, b: any) => {
                  // Se uma é destacada e outra não, destacada vem primeiro
                  if (a.featured && !b.featured) return -1
                  if (!a.featured && b.featured) return 1
                  // Se ambas são destacadas ou não, manter display_order
                  return (a.display_order || 0) - (b.display_order || 0)
                })
                
                return sortedGallery.map((item: any, index: number) => {
                  // A primeira imagem da lista reordenada será a destacada grande
                  const isLarge = index === 0

                if (isLarge) {
                  // Imagem grande em destaque (2 colunas x 2 linhas)
                  return (
                    <div
                      key={item.id}
                      className="group overflow-hidden hover:shadow-2xl transition-all duration-500 md:col-span-2 md:row-span-2 rounded-xl shadow-lg relative aspect-[2/1] md:aspect-auto"
                    >
                      <div className="absolute inset-0">
                        <Image
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-6 left-6 right-6 text-white transform translate-y-0 transition-all duration-300 opacity-100">
                        <h3 className="font-bold text-2xl mb-2 drop-shadow-lg">{item.title}</h3>
                        {item.description && (
                          <p className="text-white/95 drop-shadow-md">{item.description}</p>
                        )}
                      </div>
                    </div>
                  )
                }

                // Imagens pequenas (1 coluna x 1 linha)
                return (
                  <div
                    key={item.id}
                    className="group overflow-hidden hover:shadow-xl transition-all duration-300 rounded-xl shadow-lg relative aspect-square"
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 text-white transform translate-y-0 transition-all duration-300 opacity-100">
                      <h3 className="font-semibold text-lg mb-1 drop-shadow-lg">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-white/95 drop-shadow-md">{item.description}</p>
                      )}
                    </div>
                  </div>
                )
              })
              })()}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma imagem na galeria ainda</p>
            </div>
          )}

          {galleryTotalCount > 5 && (
            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                className="hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
                asChild
              >
                <a href="/galeria">Ver Galeria Completa</a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="relative py-20 bg-muted/30 overflow-hidden">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-10"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
              fill="rgb(248 250 252)"
            ></path>
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="w-fit mx-auto">
              Quem Somos
            </Badge>
            <h2 className="font-sans font-bold text-3xl lg:text-4xl text-balance">
              Realizamos projetos socioambientais e ações estratégicas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Nossa missão é promover o desenvolvimento sustentável da maricultura, apoiando nossos associados com
              conhecimento técnico e científico.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Fish className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Desenvolvimento Sustentável</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Promovemos práticas sustentáveis na maricultura, respeitando o meio ambiente marinho.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Investigação Científica</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Apoiamos pesquisas e estudos para o avanço da maricultura no estado de São Paulo.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Waves className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Organização da Maricultura</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Estruturamos e organizamos o setor para melhor atender produtores e consumidores.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Excelência Reconhecida</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Certificações internacionais e reconhecimento pela qualidade dos nossos serviços.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Producers Section */}
      <section id="produtores" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="w-fit mx-auto">
              Produtores
            </Badge>
            <h2 className="font-sans font-bold text-3xl lg:text-4xl text-balance">
              Navegue pelo mapa e conheça os produtores
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Descubra os produtores associados à AMESP espalhados pelo litoral norte de São Paulo.
            </p>
          </div>

          {producers && producers.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {producers.slice(0, 3).map((producer) => (
                <Card
                  key={producer.id}
                  className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-card to-card/50"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{producer.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <MapPin className="mr-1 h-3 w-3" />
                          {producer.location}
                        </div>
                      </div>
                      {producer.certification_level && (
                        <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20">
                          {producer.certification_level}
                        </Badge>
                      )}
                    </div>

                    {producer.specialties && producer.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {producer.specialties.slice(0, 3).map((specialty: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-accent/20">
                            {specialty}
                          </Badge>
                        ))}
                        {producer.specialties.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-accent/20">
                            +{producer.specialties.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {producer.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{producer.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="relative">
            <Card className="overflow-hidden border-0 shadow-xl">
              <CardContent className="p-0">
                <div className="relative h-96 bg-gradient-to-br from-primary/10 to-accent/10">
                  {/* Mapa MapLibre */}
                  {nextDynamic(() => import("@/components/public/HomeMap"), { ssr: false })({})}
                  <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-md rounded-lg p-3 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="font-medium text-sm">Mapa interativo</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="eventos" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="w-fit mx-auto">
              Eventos
            </Badge>
            <h2 className="font-sans font-bold text-3xl lg:text-4xl text-balance">
              I Workshop Nacional da Maricultura
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Participe do maior evento de maricultura do país, reunindo especialistas, produtores e pesquisadores.
            </p>
          </div>

          <Card className="max-w-4xl mx-auto overflow-hidden border-0 shadow-xl">
            <div className="grid md:grid-cols-2">
              <div className="relative h-64 md:h-auto">
                <Image
                  src="/professional-conference-room-with-aquaculture-expe.jpg"
                  alt="Workshop Nacional da Maricultura"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-8 flex flex-col justify-center bg-gradient-to-br from-card to-card/50">
                <div className="space-y-4">
                  <Badge variant="secondary" className="w-fit bg-primary/10 border-primary text-primary font-medium">
                    <Calendar className="mr-2 h-4 w-4" />
                    30 de Agosto a 1 de Setembro de 2024
                  </Badge>
                  <CardTitle className="text-2xl font-sans">I Workshop Nacional da Maricultura</CardTitle>
                  <CardDescription className="text-base">
                    <div className="flex items-center mb-2">
                      <MapPin className="mr-2 h-4 w-4" />
                      Ubatuba - SP
                    </div>
                    Um evento único para discutir o futuro da maricultura brasileira, com palestras, workshops práticos
                    e networking entre profissionais do setor.
                  </CardDescription>
                  <Button className="w-fit hover:scale-105 transition-transform">Saiba Mais</Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      <section id="contato" className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-8"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" fill="rgb(248 250 252 / 0.3)"></path>
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="w-fit mx-auto">
              Contato
            </Badge>
            <h2 className="font-sans font-bold text-3xl lg:text-4xl text-balance">Entre em contato conosco</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Estamos prontos para ajudar você a fazer parte da maricultura sustentável.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
              <CardHeader className="pb-6 text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Envie uma mensagem</CardTitle>
                    <CardDescription className="text-base">
                      Preencha o formulário abaixo e entraremos em contato em breve.
                    </CardDescription>
                  </div>
                </div>

                {/* Contact info inline */}
                <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mt-6 pt-6 border-t border-border/50">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>(12) 3833-8000</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>contato@amespmaricultura.org.br</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Ubatuba - SP, Brasil</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 px-8 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Nome Completo *</label>
                    <input
                      className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/60"
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">E-mail *</label>
                    <input
                      className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/60"
                      type="email"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Telefone</label>
                    <input
                      className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/60"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Empresa/Organização</label>
                    <input
                      className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/60"
                      placeholder="Nome da sua empresa"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Assunto *</label>
                  <select className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all">
                    <option>Selecione o assunto</option>
                    <option>Informações sobre associação</option>
                    <option>Consultoria técnica</option>
                    <option>Parcerias</option>
                    <option>Eventos e workshops</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Mensagem *</label>
                  <textarea
                    className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all h-40 resize-none placeholder:text-muted-foreground/60"
                    placeholder="Descreva detalhadamente como podemos ajudá-lo. Inclua informações relevantes sobre seu projeto ou necessidade..."
                  ></textarea>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="newsletter" className="rounded border-border" />
                  <label htmlFor="newsletter" className="text-sm text-muted-foreground">
                    Desejo receber newsletters e atualizações sobre maricultura
                  </label>
                </div>
                <Button className="w-full py-4 text-base font-semibold hover:scale-[1.02] transition-transform shadow-lg">
                  Enviar Mensagem
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  * Campos obrigatórios. Responderemos em até 24 horas úteis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Image
                  src="/amesp_logo.png"
                  alt="AMESP"
                  width={100}
                  height={32}
                  className="h-8 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-primary-foreground/80 text-sm">
                Associação dos Maricultores do Estado de São Paulo - Promovendo a maricultura sustentável desde 1998.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-4">Navegação</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>
                  <a href="#sobre" className="hover:text-primary-foreground transition-colors">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a href="#noticias" className="hover:text-primary-foreground transition-colors">
                    Notícias
                  </a>
                </li>
                <li>
                  <a href="#galeria" className="hover:text-primary-foreground transition-colors">
                    Galeria
                  </a>
                </li>
                <li>
                  <a href="#produtores" className="hover:text-primary-foreground transition-colors">
                    Produtores
                  </a>
                </li>
                <li>
                  <a href="#eventos" className="hover:text-primary-foreground transition-colors">
                    Eventos
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>(12) 3833-8000</li>
                <li>contato@amespmaricultura.org.br</li>
                <li>Ubatuba - SP, Brasil</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Siga-nos</h4>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Facebook
                </Button>
                <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Instagram
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
            <p>&copy; 2024 AMESP - Associação dos Maricultores do Estado de São Paulo. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
