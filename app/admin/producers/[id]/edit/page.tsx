import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProducerForm } from "@/components/admin/producer-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EditProducer({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: producer, error } = await supabase.from("producers").select("*").eq("id", id).single()

  if (error || !producer) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Produtor</h1>
        <p className="text-muted-foreground">Edite as informações do produtor</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Produtor</CardTitle>
          <CardDescription>Atualize os campos abaixo para editar o produtor</CardDescription>
        </CardHeader>
        <CardContent>
          <ProducerForm initialData={producer} />
        </CardContent>
      </Card>
    </div>
  )
}
