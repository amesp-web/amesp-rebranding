import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { NewsForm } from "@/components/admin/news-form"

export default function NewNewsPage() {
  return (
    <div className="space-y-8">
      {/* Header moderno, padrão das páginas admin */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 shadow-xl">
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Nova Notícia</h1>
            <p className="text-white/90">Crie uma notícia para exibir na Home</p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-cyan-50/50 to-teal-50/30 border-b border-blue-200/50">
          <CardTitle className="text-xl font-bold text-slate-800">Informações da Notícia</CardTitle>
          <CardDescription className="text-slate-600">Preencha os campos abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <NewsForm />
        </CardContent>
      </Card>
    </div>
  )
}
