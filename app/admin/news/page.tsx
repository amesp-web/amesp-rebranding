import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Newspaper } from "lucide-react"
import { NewsListDnD } from "@/components/admin/NewsListDnD"

export default async function AdminNewsList() {
  const supabase = await createClient()
  const { data: news } = await supabase
    .from('news')
    .select('id, title, created_at, image_url, published, views, likes, display_order')
    .order('display_order', { ascending: true })
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

      {news && news.length > 0 ? (
        <NewsListDnD items={(news || []).map((n: any) => ({ ...n, id: String(n.id) }))} />
      ) : (
        <div className="text-muted-foreground">Nenhuma notícia publicada ainda.</div>
      )}
    </div>
  )
}

// removed legacy management view
