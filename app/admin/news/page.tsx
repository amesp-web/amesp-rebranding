import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Eye, Trash2, Search } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { NewsActions } from "@/components/admin/news-actions"

export default async function NewsManagement({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; filter?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase.from("news").select("*").order("created_at", { ascending: false })

  // Apply search filter
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,excerpt.ilike.%${params.search}%`)
  }

  // Apply status filter
  if (params.filter === "published") {
    query = query.eq("published", true)
  } else if (params.filter === "draft") {
    query = query.eq("published", false)
  }

  const { data: news, error } = await query

  if (error) {
    console.error("Error fetching news:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Notícias</h1>
          <p className="text-muted-foreground">Crie, edite e publique notícias</p>
        </div>
        <Button asChild>
          <Link href="/admin/news/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Notícia
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar notícias..." className="pl-10" defaultValue={params.search} name="search" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant={!params.filter ? "default" : "outline"} size="sm" asChild>
                <Link href="/admin/news">Todas</Link>
              </Button>
              <Button variant={params.filter === "published" ? "default" : "outline"} size="sm" asChild>
                <Link href="/admin/news?filter=published">Publicadas</Link>
              </Button>
              <Button variant={params.filter === "draft" ? "default" : "outline"} size="sm" asChild>
                <Link href="/admin/news?filter=draft">Rascunhos</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Notícias</CardTitle>
          <CardDescription>Gerencie todas as notícias do site ({news?.length || 0} encontradas)</CardDescription>
        </CardHeader>
        <CardContent>
          {news && news.length > 0 ? (
            <div className="space-y-4">
              {news.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{article.title}</h3>
                      <Badge variant={article.published ? "default" : "secondary"}>
                        {article.published ? "Publicada" : "Rascunho"}
                      </Badge>
                      <Badge variant="outline">{article.category}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Criada em {new Date(article.created_at).toLocaleDateString("pt-BR")}</span>
                      <span>{article.views || 0} visualizações</span>
                      <span>{article.read_time || 5} min de leitura</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/news/${article.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/news/${article.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <NewsActions articleId={article.id} published={article.published} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trash2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma notícia encontrada</h3>
              <p className="text-muted-foreground">
                {params.search || params.filter
                  ? "Tente ajustar os filtros de busca"
                  : "Comece criando sua primeira notícia"}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/admin/news/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Notícia
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
