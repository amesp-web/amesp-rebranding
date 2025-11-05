import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, Eye, Newspaper, ArrowLeft } from "lucide-react"
import { NewsLikeButton } from "@/components/public/NewsLikeButton"
import { NewsReaderModal } from "@/components/public/NewsReaderModal"
import { ShareCopyButton } from "@/components/public/ShareCopyButton"
import { ViewsCounter } from "@/components/public/ViewsCounter"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AllNewsPage() {
  const supabase = await createClient()
  const { data: news } = await supabase
    .from('news')
    .select('id, title, content, image_url, category, created_at, read_time, views, likes, display_order, published')
    .eq('published', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12]">
      {/* Header moderno similar ao de galeria e downloads */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#023299] via-cyan-500 to-teal-400">
        {/* SVG Waves */}
        <div className="absolute inset-0">
          <svg className="absolute bottom-0 w-full h-32" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="white" fillOpacity="0.3" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <path fill="white" fillOpacity="0.2" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,165.3C960,149,1056,171,1152,186.7C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 md:py-20">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Image src="/amesp_logo.png" alt="AMESP" width={180} height={60} className="h-16 w-auto" />
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
              Notícias
            </span>
          </div>

          {/* Título e Subtítulo */}
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-3">
            Acompanhe as Novidades da Maricultura
          </h1>
          <p className="text-white/90 text-center text-lg max-w-2xl mx-auto mb-6">
            Todas as publicações em um só lugar: eventos, ações e conquistas do setor
          </p>

          {/* Voltar para Home */}
          <div className="flex justify-center mt-8">
            <Link href="/">
              <Button variant="secondary" className="bg-white/90 hover:bg-white text-blue-600 shadow-lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para a Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">

        {/* Grid de notícias */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(news || []).map((article: any, index: number) => (
          <Card key={article.id} className={`group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden rounded-2xl border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm ${index === 0 ? "md:col-span-2 lg:col-span-1" : ""}`}>
            <div className="relative overflow-hidden rounded-t-2xl">
              <Image
                src={article.image_url || "/placeholder.svg"}
                alt={article.title}
                width={600}
                height={300}
                className="block w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-4 left-4">
                {article.category && (
                  <Badge variant="secondary" className="bg-primary/90 text-primary-foreground backdrop-blur-md shadow-lg border-0 font-medium">
                    {article.category}
                  </Badge>
                )}
              </div>
              <div className="absolute bottom-4 right-4 flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-background/95 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg">
                  <NewsLikeButton id={String(article.id)} initialLikes={article.likes || 0} />
                </div>
                <ShareCopyButton id={String(article.id)} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>
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
              <h3 className="text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
              <p className="text-muted-foreground line-clamp-3 mb-4">{article.excerpt || ''}</p>
              <NewsReaderModal article={{
                id: String(article.id),
                title: article.title,
                content: article.content,
                image_url: article.image_url,
                category: article.category,
                created_at: article.created_at,
                read_time: article.read_time,
                views: article.views,
                // @ts-ignore incluir likes para contador no modal
                likes: article.likes,
              }} />
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    </div>
  )
}


