import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProducerForm } from "@/components/admin/producer-form"

export default function NewProducer() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo Produtor</h1>
        <p className="text-muted-foreground">Adicione um novo produtor associado</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Produtor</CardTitle>
          <CardDescription>Preencha os campos abaixo para adicionar um novo produtor</CardDescription>
        </CardHeader>
        <CardContent>
          <ProducerForm />
        </CardContent>
      </Card>
    </div>
  )
}
