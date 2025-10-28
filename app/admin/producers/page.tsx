import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, MapPin, Edit, Eye, Search, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ProducerActions } from "@/components/admin/producer-actions"

export default async function ProducersManagement({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; filter?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase.from("producers").select("*").order("created_at", { ascending: false })

  // Apply search filter
  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,location.ilike.%${params.search}%,specialties.cs.{${params.search}}`,
    )
  }

  // Apply status filter
  if (params.filter === "active") {
    query = query.eq("active", true)
  } else if (params.filter === "inactive") {
    query = query.eq("active", false)
  }

  const { data: producers, error } = await query

  if (error) {
    console.error("Error fetching producers:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Produtores</h1>
          <p className="text-muted-foreground">Adicione e gerencie produtores associados</p>
        </div>
        <Button asChild>
          <Link href="/admin/producers/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Produtor
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
                <Input
                  placeholder="Buscar produtores..."
                  className="pl-10"
                  defaultValue={params.search}
                  name="search"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant={!params.filter ? "default" : "outline"} size="sm" asChild>
                <Link href="/admin/producers">Todos</Link>
              </Button>
              <Button variant={params.filter === "active" ? "default" : "outline"} size="sm" asChild>
                <Link href="/admin/producers?filter=active">Ativos</Link>
              </Button>
              <Button variant={params.filter === "inactive" ? "default" : "outline"} size="sm" asChild>
                <Link href="/admin/producers?filter=inactive">Inativos</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtores</CardTitle>
          <CardDescription>
            Gerencie todos os produtores associados ({producers?.length || 0} encontrados)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {producers && producers.length > 0 ? (
            <div className="space-y-4">
              {producers.map((producer) => (
                <div
                  key={producer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg">{producer.name}</h3>
                      <Badge variant={producer.active ? "default" : "secondary"}>
                        {producer.active ? "Ativo" : "Inativo"}
                      </Badge>
                      {producer.certification_level && <Badge variant="outline">{producer.certification_level}</Badge>}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {producer.location}
                      </div>
                      {producer.contact_phone && (
                        <div className="flex items-center">
                          <Phone className="mr-1 h-3 w-3" />
                          {producer.contact_phone}
                        </div>
                      )}
                      {producer.contact_email && (
                        <div className="flex items-center">
                          <Mail className="mr-1 h-3 w-3" />
                          {producer.contact_email}
                        </div>
                      )}
                    </div>

                    {producer.specialties && producer.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {producer.specialties.map((specialty: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {producer.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2">{producer.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/producers/${producer.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/producers/${producer.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <ProducerActions producerId={producer.id} active={producer.active} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum produtor encontrado</h3>
              <p className="text-muted-foreground">
                {params.search || params.filter
                  ? "Tente ajustar os filtros de busca"
                  : "Comece adicionando seu primeiro produtor"}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/admin/producers/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produtor
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
