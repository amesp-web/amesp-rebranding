import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function GalleryManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Galeria</h1>
          <p className="text-muted-foreground">Adicione e organize imagens da galeria</p>
        </div>
        <Button asChild>
          <Link href="/admin/gallery/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Imagem
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Galeria de Imagens</CardTitle>
          <CardDescription>Gerencie todas as imagens do site</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">Funcionalidade será implementada na próxima etapa</p>
        </CardContent>
      </Card>
    </div>
  )
}
