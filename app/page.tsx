import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NewsLikeButton } from "@/components/public/NewsLikeButton"
import { ViewsCounter } from "@/components/public/ViewsCounter"
import { ShareCopyButton } from "@/components/public/ShareCopyButton"
import { ProjectsDropdown } from "@/components/public/ProjectsDropdown"
import { MobileMenu } from "@/components/public/MobileMenu"
import { AboutSection } from "@/components/public/AboutSection"
import { MariculturaSection } from "@/components/public/MariculturaSection"
import { TurismoSection } from "@/components/public/TurismoSection"
import { HeroButtons } from "@/components/public/HeroButtons"
import { LogoLink } from "@/components/public/LogoLink"
import Image from "next/image"
import HomeEventsSection from "@/components/public/HomeEventsSection"
import { FishDecoration } from "@/components/decorative/FishDecoration"
import nextDynamic from "next/dynamic"

// 🚀 OTIMIZAÇÃO: Lazy load de componentes abaixo da dobra
const ContactForm = nextDynamic(
  () => import("@/components/public/ContactForm").then(mod => ({ default: mod.ContactForm })),
  {
    loading: () => (
      <div className="animate-pulse bg-muted/20 h-[500px] rounded-xl border border-border/50" />
    ),
    ssr: false // Não renderizar no servidor (economia de processamento)
  }
)

const FishSwarm = nextDynamic(
  () => import("@/components/decorative/FishSwarm").then(mod => ({ default: mod.FishSwarm })),
  {
    ssr: false // Apenas decorativo, não precisa de SSR
  }
)

const NewsReaderModal = nextDynamic(
  () => import("@/components/public/NewsReaderModal").then(mod => ({ default: mod.NewsReaderModal })),
  {
    ssr: false // Modal só carrega quando clicado
  }
)
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
  Camera,
  LogIn,
  UserPlus,
} from "lucide-react"

// 🚀 OTIMIZAÇÃO: ISR - Cacheia por 60s, regenera automaticamente
export const revalidate = 60

async function getSupabaseData() {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    // 🚀 OTIMIZAÇÃO: Executar TODAS as queries em paralelo do Supabase
    const [
      newsResult,
      galleryAllResult,
      totalCountResult,
      producersResult,
      projectsResult,
      eventsResult
    ] = await Promise.all([
      // News
      supabase
        .from("news")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(3),
      
      // Gallery (buscar featured e 4 outros)
      supabase
        .from("gallery")
        .select("*")
        .order("featured", { ascending: false })
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .limit(5),
      
      // Gallery count
      supabase
        .from("gallery")
        .select("*", { count: "exact", head: true }),
      
      // Producers (select específico)
      supabase
        .from("producers")
        .select("id, name, location, specialties, description, certification_level, latitude, longitude")
        .eq("active", true)
        .order("name", { ascending: true }),
      
      // Projects
      supabase
        .from("projects")
        .select("id, name, slug, submenu_label")
        .eq("published", true)
        .order("display_order", { ascending: true }),
      
      // Events (para HomeEventsSection)
      supabase
        .from("events")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(2)
    ])

    // Processar galeria: separar featured das outras
    let galleryHome: any[] = []
    const allGallery = galleryAllResult.data || []
    
    if (allGallery.length > 0) {
      const featured = allGallery.find(img => img.featured === true)
      if (featured) {
        galleryHome.push(featured)
        const others = allGallery.filter(img => img.id !== featured.id).slice(0, 4)
        galleryHome = [...galleryHome, ...others]
      } else {
        // Se não houver featured, pegar as 5 primeiras
        galleryHome = allGallery.slice(0, 5)
      }
    }

    // 🔧 Buscar about e home-info via Supabase Service Client (igual à API)
    const { createClient: createServiceClient } = await import("@supabase/supabase-js")
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    // 🚀 OTIMIZAÇÃO: Unificar TODAS as queries em um único Promise.all
    const aboutContentResult = await serviceClient
      .from("about_content")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .single()
    
    const aboutFeaturesResult = await serviceClient
      .from("about_features")
      .select("*")
      .order("display_order", { ascending: true })
    
    const mariculturaContentResult = await serviceClient
      .from("maricultura_content")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .single()
    
    const mariculturaFeaturesResult = await serviceClient
      .from("maricultura_features")
      .select("*")
      .order("display_order", { ascending: true })
    
    const turismoContentResult = await serviceClient
      .from("turismo_content")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .single()
    
    const turismoFeaturesResult = await serviceClient
      .from("turismo_features")
      .select("*")
      .order("display_order", { ascending: true })
    
    const homeInfoResult = await serviceClient
      .from("home_info")
      .select("*")
      .limit(1)
      .single()
    
    // Montar objetos no formato esperado (igual à API)
    const about = {
      content: aboutContentResult.data,
      features: aboutFeaturesResult.data || []
    }
    
    const maricultura = {
      content: mariculturaContentResult.data,
      features: mariculturaFeaturesResult.data || []
    }
    
    const turismo = {
      content: turismoContentResult.data,
      features: turismoFeaturesResult.data || []
    }
    
    const homeInfo = homeInfoResult.data

    return { 
      news: newsResult.data, 
      gallery: galleryHome, 
      producers: producersResult.data, 
      galleryTotalCount: totalCountResult.count || 0, 
      about, 
      maricultura,
      turismo,
      projects: projectsResult.data || [], 
      homeInfo,
      events: eventsResult.data || []
    }
  } catch (error) {
    console.error("[v0] Failed to fetch Supabase data:", error)
    return { news: null, gallery: null, producers: null, galleryTotalCount: 0, about: null, maricultura: null, turismo: null, projects: [], homeInfo: null, events: [] }
  }
}

export default async function HomePage() {
  const { news, gallery, producers, galleryTotalCount, about, maricultura, turismo, projects, homeInfo, events } = await getSupabaseData()
  
  // Garantir que projects é um array válido e serializável
  const safeProjects = Array.isArray(projects) ? projects : []

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
      {/* Header Modernizado */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-gradient-to-r from-background via-background/98 to-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 relative shadow-sm">
        {/* Elementos decorativos sutis */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-2 left-4 opacity-20">
            <Image
              src="/fishdecor.png"
              alt=""
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
              loading="lazy"
            />
          </div>
          <div className="absolute bottom-2 right-8 opacity-15 rotate-12">
            <Image
              src="/fishdecor.png"
              alt=""
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
              loading="lazy"
            />
          </div>
        </div>

        <div className="container mx-auto px-4 flex h-20 items-center justify-between relative">
          {/* Logo - Clicável para voltar ao topo */}
          <LogoLink />

          {/* Navegação Desktop */}
          <nav className="hidden xl:flex items-center space-x-0.5">
            <a
              href="#sobre"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
            >
              Sobre Nós
            </a>
            <a
              href="#noticias"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
            >
              Notícias
            </a>
            <a
              href="#galeria"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
            >
              Galeria
            </a>
            <a
              href="#produtores"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
            >
              Produtores
            </a>
            <a
              href="#maricultura"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
            >
              Maricultura
            </a>
            <a
              href="#turismo"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
            >
              Turismo
            </a>
            <ProjectsDropdown />
            <a
              href="/downloads"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
            >
              Downloads
            </a>
            <a
              href="#eventos"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
            >
              Eventos
            </a>
            <a
              href="#contato"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
            >
              Contato
            </a>
          </nav>

          {/* Botões de ação - Desktop */}
          <div className="hidden xl:flex items-center space-x-3">
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#023299] to-cyan-500 hover:from-[#023299]/90 hover:to-cyan-500/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
              asChild
            >
              <a href="/login" className="flex items-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span>Entrar</span>
              </a>
            </Button>
            {/* NOTA: Botão escondido temporariamente a pedido do cliente (ainda não sabem se irão utilizar) */}
            <Button
              size="sm"
              className="hidden bg-gradient-to-r from-[#023299] to-cyan-500 hover:from-[#023299]/90 hover:to-cyan-500/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
              asChild
            >
              <a href="/maricultor/cadastro" className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Cadastrar-se</span>
              </a>
            </Button>
          </div>

          {/* Menu Mobile/Tablet */}
          <MobileMenu projects={safeProjects} />
        </div>

        {/* Linha decorativa inferior */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <FishSwarm count={3} className="hidden md:block" />
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  {homeInfo?.badge_text || 'Desde 1998'}
                </Badge>
                <h1 className="font-sans font-bold text-4xl lg:text-6xl text-balance leading-tight">
                  {homeInfo?.title || 'Associação dos Maricultores do Estado de São Paulo'}
                </h1>
                <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                  {homeInfo?.description || 'Trabalhamos para o desenvolvimento e organização da maricultura sustentável no litoral norte do estado de São Paulo. Nossos objetivos são promover o desenvolvimento sustentável e a investigação científica.'}
                </p>
              </div>
              <HeroButtons aboutBlocks={about?.content?.content || []} />
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={homeInfo?.hero_image_url || "/sustainable-aquaculture-farm-with-workers-in-boats.jpg"}
                  alt="Maricultura sustentável"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover aspect-[4/3]"
                  priority
                  quality={85}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                {/* Peixe decorativo escondido no canto superior direito */}
                <div className="absolute -top-3 -right-3 opacity-40 z-10 pointer-events-none">
                  <Image
                    src="/fishdecor.png"
                    alt=""
                    width={64}
                    height={64}
                    className="w-12 h-12 md:w-16 md:h-16 object-contain rotate-12"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card border rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Waves className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Sustentabilidade</div>
                    <div className="text-xs text-muted-foreground">{homeInfo?.sustainability_tag || '100% Sustentável'}</div>
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
                {homeInfo?.years_experience || 25}+
              </div>
              <div className="text-base text-slate-700 font-medium drop-shadow-sm">Anos de Experiência</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-slate-600/40"></div>
            <div className="text-center group">
              <div className="font-sans font-bold text-3xl lg:text-4xl text-slate-800 mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                {homeInfo?.associated_producers || 100}+
              </div>
              <div className="text-base text-slate-700 font-medium drop-shadow-sm">Produtores Associados</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-slate-600/40"></div>
            <div className="text-center group">
              <div className="font-sans font-bold text-3xl lg:text-4xl text-slate-800 mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                {homeInfo?.completed_projects || 50}+
              </div>
              <div className="text-base text-slate-700 font-medium drop-shadow-sm">Projetos Realizados</div>
            </div>
          </div>
        </div>
      </section>

      <section id="noticias" className="relative py-20 bg-muted/30 overflow-hidden">
        <FishSwarm count={3} className="hidden md:block" />
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
                className={`group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden rounded-2xl border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm ${index === 0 ? "md:col-span-2 lg:col-span-1" : ""}`}
              >
                <div className="relative overflow-hidden rounded-t-2xl">
                  <Image
                    src={article.image_url || "/placeholder.svg"}
                    alt={article.title}
                    width={600}
                    height={300}
                    className="block w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Linha gradiente encostada à imagem */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#023299] to-accent" />
                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="secondary"
                      className="bg-primary/90 text-primary-foreground backdrop-blur-md shadow-lg border-0 font-medium"
                    >
                      {article.category}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-background/95 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg">
                      {/* id fictício para exemplo quando mock */}
                      {news ? (
                        <NewsLikeButton id={String(article.id)} initialLikes={article.likes || 0} />
                      ) : (
                        <NewsLikeButton id={`mock-${article.id}`} initialLikes={0} />
                      )}
                    </div>
                    <ShareCopyButton id={String(article.id)} />
                  </div>
                </div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(article.created_at).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {article.read_time}min
                    </div>
                    <ViewsCounter id={String(article.id)} initialViews={article.views || 0} />
                  </div>
                  <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 mb-4">{article.excerpt}</CardDescription>
                  <NewsReaderModal article={{
                    id: String(article.id),
                    title: article.title,
                    content: article.content,
                    image_url: article.image_url,
                    category: article.category,
                    created_at: article.created_at,
                    read_time: article.read_time,
                    views: article.views,
                    likes: article.likes,
                  }} />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#023299] to-cyan-500 hover:from-[#023299]/90 hover:to-cyan-500/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
              asChild
            >
              <a href="/news">Ver Todas as Notícias</a>
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
                size="lg"
                className="bg-gradient-to-r from-[#023299] to-cyan-500 hover:from-[#023299]/90 hover:to-cyan-500/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
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
        <FishSwarm count={4} className="hidden md:block" />
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
          <AboutSection about={about} />
        </div>
      </section>

      {/* Producers Section */}
      <section id="produtores" className="relative py-20 overflow-hidden">
        <FishSwarm count={3} className="hidden md:block" />
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

      {/* Maricultura Section */}
      <section id="maricultura" className="relative py-20 bg-muted/30 overflow-hidden">
        <FishSwarm count={3} className="hidden md:block" />
        <div className="container mx-auto px-4 relative z-10">
          <MariculturaSection maricultura={maricultura} />
        </div>
      </section>

      {/* Turismo Section */}
      <section id="turismo" className="relative py-20 overflow-hidden">
        <FishSwarm count={2} className="hidden md:block" />
        <div className="container mx-auto px-4 relative z-10">
          <TurismoSection turismo={turismo} />
        </div>
      </section>

      {/* Events Section */}
      <section id="eventos" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <HomeEventsSection initialEvents={events || []} />
        </div>
      </section>

      <section id="contato" className="relative py-20 overflow-hidden">
        <FishSwarm count={4} className="hidden md:block" />
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
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 relative overflow-hidden">
        <FishSwarm count={5} className="hidden md:block" />
        {/* Alga decorativa no canto direito */}
        <div className="absolute -bottom-8 right-0 pointer-events-none select-none opacity-60">
          <Image
            src="/algadecor.png"
            alt=""
            width={200}
            height={200}
            className="h-auto w-48 md:w-64 object-contain"
            unoptimized
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-foreground/80 hover:bg-[#023299] hover:text-white transition-all duration-200"
                  asChild
                >
                  <a href="https://www.facebook.com/amesp.maricultores" target="_blank" rel="noopener noreferrer">
                    Facebook
                  </a>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-foreground/80 hover:bg-[#023299] hover:text-white transition-all duration-200"
                  asChild
                >
                  <a href="https://www.instagram.com/amesp.maricultura/" target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
            <p>&copy; 2025 AMESP - Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
