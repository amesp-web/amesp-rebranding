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
    <div className="space-y-8">
      {/* Header moderno */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 shadow-xl">
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Editar Notícia</h1>
            <p className="text-white/90">Atualize as informações da notícia</p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-cyan-50/50 to-teal-50/30 border-b border-blue-200/50">
          <CardTitle className="text-xl font-bold text-slate-800">Informações da Notícia</CardTitle>
          <CardDescription className="text-slate-600">Atualize os campos abaixo para editar a notícia</CardDescription>
        </CardHeader>
        <CardContent>
          <NewsForm initialData={article} />
        </CardContent>
      </Card>
    </div>
  )
}
