import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { NewsForm } from "@/components/admin/news-form"

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nova Notícia</h1>
      </div>
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50/30 to-teal-50/30 ring-1 ring-black/5 rounded-2xl">
        <CardHeader>
          <CardTitle>Informações da Notícia</CardTitle>
          <CardDescription>Preencha os campos abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <NewsForm />
        </CardContent>
      </Card>
    </div>
  )
}
