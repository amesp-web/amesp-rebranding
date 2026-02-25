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
  const { data: newsRaw } = await supabase
    .from('news')
    .select('id, title, content, image_url, category, created_at, read_time, views, likes, display_order, published')
    .eq('published', true)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  const news = (newsRaw || []).slice().sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  )

  return (
    <div className="min-h-screen bg-[#ECEEEE]">
      {/* Hero com banner de Notícias ocupando toda a largura */}
      <div className="bg-[#ECEEEE] pt-6 md:pt-8">
        <div className="relative w-full">
          <div className="overflow-hidden shadow-2xl border-y border-white/40 bg-white">
            <Image
              src="/news-hero.png"
              alt="Notícias - estamos na mídia"
              width={1920}
              height={400}
              priority
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Voltar para Home */}
        <div className="container mx-auto px-4 mt-4 mb-4 flex justify-center">
          <Link href="/">
            <Button variant="secondary" className="bg-white/90 hover:bg-white text-blue-600 shadow-lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a Home
            </Button>
          </Link>
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


