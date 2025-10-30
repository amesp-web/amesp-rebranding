import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Calendar, Clock, Eye, Newspaper } from "lucide-react"
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
    <div className="space-y-8">
      {/* Header inspirado na galeria da Home */}
      <header className="relative overflow-hidden rounded-2xl border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/30" />
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="rgb(59 130 246 / 0.12)"/>
          </svg>
        </div>
        <div className="relative px-6 py-10 text-center">
          <div className="flex justify-center mb-4">
            <Image src="/amesp_logo.png" alt="AMESP" width={140} height={40} className="h-10 w-auto" />
          </div>
          <Badge variant="secondary" className="w-fit mx-auto bg-primary/10 text-primary border-primary/20 mb-3">Notícias</Badge>
          <h1 className="font-sans font-bold text-3xl lg:text-4xl text-balance">Acompanhe as novidades da maricultura</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">Todas as publicações em um só lugar: eventos, ações e conquistas do setor.</p>
          <div className="mt-6">
            <a href="/" className="inline-flex items-center text-sm text-primary hover:underline">
              ← Voltar para a Home
            </a>
          </div>
        </div>
      </header>

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
  )
}


