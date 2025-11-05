import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Phone, Factory, Users, CalendarDays, ChevronRight, User as UserIcon } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { MaricultorStatusBadge } from "@/components/admin/maricultor-status-badge"
import { MaricultorToggle } from "@/components/admin/maricultor-toggle"
import { AddMaricultorButton } from "@/components/admin/AddMaricultorButton"
import { EditMaricultorButton } from "@/components/admin/EditMaricultorButton"

function normalizeSpecialties(value: any): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === "string") {
    // Try JSON first
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch {}
    // Fallback: comma/semicolon separated
    return value
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

function getInitials(name?: string | null): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatCPF(cpf?: string | null): string {
  if (!cpf) return ""
  const cleaned = cpf.replace(/\D/g, "")
  if (cleaned.length !== 11) return cpf
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export default async function ProducersManagement({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; filter?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Buscar maricultores
  let query = supabase
    .from("maricultor_profiles")
    .select(
      "id, full_name, cpf, contact_phone, cep, logradouro, cidade, estado, company, specialties, latitude, longitude, created_at, is_active"
    )
    .order("created_at", { ascending: false })

  if (params.search) {
    const s = params.search
    query = query.or(`full_name.ilike.%${s}%,cidade.ilike.%${s}%,estado.ilike.%${s}%,company.ilike.%${s}%`)
  }
  if (params.filter === "active") {
    query = query.eq("is_active", true)
  } else if (params.filter === "inactive") {
    query = query.eq("is_active", false)
  }

  const { data: producers, error } = await query

  if (error) {
    console.error("Error fetching maricultores:", error)
  }

  const total = producers?.length || 0
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const thisMonth = (producers || []).filter((p) => p.created_at && new Date(p.created_at) >= startOfMonth).length

  return (
    <div className="space-y-8">
      {/* Header moderno com KPIs */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 shadow-xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        </div>
        <div className="relative">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center drop-shadow">
                <Factory className="h-8 w-8 mr-3" /> Produtores
              </h1>
              <p className="text-blue-50/90 text-lg">Acompanhe e gerencie os produtores cadastrados</p>
            </div>
            
            {/* Botão de adicionar no header */}
            <AddMaricultorButton />
          </div>
          
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-6 text-white">
              <div className="rounded-xl bg-white/10 backdrop-blur-md px-4 py-3 shadow-lg border border-white/20">
                <div className="text-sm text-blue-50/90">Total cadastrados</div>
                <div className="mt-1 text-2xl font-bold flex items-center">
                  <Users className="h-5 w-5 mr-2" /> {total}
                </div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-md px-4 py-3 shadow-lg border border-white/20">
                <div className="text-sm text-blue-50/90">Neste mês</div>
                <div className="mt-1 text-2xl font-bold flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2" /> {thisMonth}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-md ring-1 ring-black/5 bg-gradient-to-br from-card to-card/60">
        <CardHeader>
          <CardTitle className="text-slate-800">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar maricultor, cidade, estado ou empresa..."
                  className="pl-10 rounded-xl border-2 border-blue-200/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  defaultValue={params.search}
                  name="search"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className={`rounded-full px-4 shadow-sm ${!params.filter ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15' : ''}`}
              >
                <Link href="/admin/producers">Todos</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className={`rounded-full px-4 shadow-sm ${
                  params.filter === 'active' 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' 
                    : 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                }`}
              >
                <Link href="/admin/producers?filter=active">Ativos</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className={`rounded-full px-4 shadow-sm ${
                  params.filter === 'inactive' 
                    ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' 
                    : 'hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                }`}
              >
                <Link href="/admin/producers?filter=inactive">Inativos</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista moderna */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/60">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">Lista de Produtores</CardTitle>
          <CardDescription className="text-slate-600">Gerencie todos os produtores cadastrados ({producers?.length || 0} encontrados)</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {producers && producers.length > 0 ? (
            <div className="space-y-4">
              {producers.map((p) => (
                <div
                  key={p.id}
                  className="group flex items-center justify-between p-5 rounded-2xl transition-all bg-gradient-to-br from-background to-card/40 shadow-md border-0 ring-1 ring-black/5 hover:ring-primary/20 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative h-12 w-12 shrink-0 rounded-xl bg-primary/10 text-primary grid place-items-center font-semibold">
                      <span>{getInitials(p.full_name)}</span>
                      <div className="absolute inset-0 rounded-xl ring-1 ring-primary/20" />
                    </div>
                    <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">{p.full_name || "Maricultor"}</h3>
                        <MaricultorStatusBadge id={p.id} initialActive={!!p.is_active} />
                        {p.company && <Badge variant="outline" className="bg-primary/5 border-primary/20">{p.company}</Badge>}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {p.cidade}
                        {p.estado ? ` - ${p.estado}` : ""}
                      </div>
                      {p.contact_phone && (
                        <div className="flex items-center">
                          <Phone className="mr-1 h-3 w-3" /> {p.contact_phone}
                        </div>
                      )}
                      {p.cpf && (
                        <div className="flex items-center">
                          <UserIcon className="mr-1 h-3 w-3" /> {formatCPF(p.cpf)}
                        </div>
                      )}
                    </div>

                    {normalizeSpecialties(p.specialties).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {normalizeSpecialties(p.specialties).map((s: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-gradient-to-r from-pink-500/90 to-rose-500/90 text-white border-0 shadow-sm hover:shadow-md transition-shadow font-medium">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {p.logradouro && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {p.logradouro}
                      </p>
                    )}
                    </div>
                  </div>

                  <div className="ml-4 flex items-center gap-2">
                    <EditMaricultorButton maricultor={p} />
                    <MaricultorToggle id={p.id} initialActive={!!p.is_active} />
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum maricultor encontrado</h3>
              <p className="text-muted-foreground">
                {params.search || params.filter ? "Tente ajustar os filtros de busca" : "Cadastro de maricultores é feito pelo formulário público"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
