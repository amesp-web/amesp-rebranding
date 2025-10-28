import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NewsForm } from "@/components/admin/news-form"

export default function NewNews() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nova Notícia</h1>
        <p className="text-muted-foreground">Crie uma nova notícia para o site</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Notícia</CardTitle>
          <CardDescription>Preencha os campos abaixo para criar uma nova notícia</CardDescription>
        </CardHeader>
        <CardContent>
          <NewsForm />
        </CardContent>
      </Card>
    </div>
  )
}
