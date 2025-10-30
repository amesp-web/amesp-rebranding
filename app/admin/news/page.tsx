import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Heart, Eye, Newspaper } from "lucide-react"

export default async function AdminNewsList() {
  const supabase = await createClient()
  const { data: news } = await supabase
    .from('news')
    .select('id, title, created_at, image_url, published, views, likes')
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      {/* Header moderno */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 shadow-xl">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Newspaper className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Notícias Publicadas</h1>
              <p className="text-white/90">Gerencie as notícias exibidas na Home</p>
            </div>
          </div>
          <Button asChild className="rounded-2xl px-5 bg-white text-blue-700 hover:bg-white/90 shadow-lg">
            <Link href="/admin/news/new">Nova Notícia</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(news || []).map(n => (
          <Card key={n.id} className="border-0 shadow-lg bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/30 ring-1 ring-black/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold line-clamp-2">{n.title}</CardTitle>
              <CardDescription>{new Date(n.created_at).toLocaleDateString('pt-BR')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1"><Heart className="h-4 w-4 text-rose-500" />{n.likes || 0}</div>
              <div className="flex items-center gap-1"><Eye className="h-4 w-4 text-blue-500" />{n.views || 0}</div>
            </CardContent>
          </Card>
        ))}
        {(!news || news.length === 0) && (
          <div className="col-span-full text-muted-foreground">Nenhuma notícia publicada ainda.</div>
        )}
      </div>
    </div>
  )
}

// removed legacy management view
