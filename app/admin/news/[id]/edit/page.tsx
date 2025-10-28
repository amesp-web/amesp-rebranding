import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NewsForm } from "@/components/admin/news-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EditNews({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: article, error } = await supabase.from("news").select("*").eq("id", id).single()

  if (error || !article) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Notícia</h1>
        <p className="text-muted-foreground">Edite as informações da notícia</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Notícia</CardTitle>
          <CardDescription>Atualize os campos abaixo para editar a notícia</CardDescription>
        </CardHeader>
        <CardContent>
          <NewsForm initialData={article} />
        </CardContent>
      </Card>
    </div>
  )
}
