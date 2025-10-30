import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EventsListDnD } from "@/components/admin/EventsListDnD"
import { Calendar } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminEventsList() {
  let events: any[] | null = null
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    const res = await fetch(`${base}/api/admin/events`, { cache: 'no-store' })
    events = await res.json()
  } catch {}
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 shadow-xl">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Eventos</h1>
              <p className="text-white/90">Gerencie os eventos do site</p>
            </div>
          </div>
          <Button asChild className="rounded-2xl px-5 bg-white text-blue-700 hover:bg-white/90 shadow-lg">
            <Link href="/admin/events/new">Novo Evento</Link>
          </Button>
        </div>
      </div>

      {events && events.length > 0 ? (
        <EventsListDnD items={(events || []).map((e: any) => ({ ...e, id: String(e.id) }))} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum evento cadastrado</CardTitle>
            <CardDescription>Crie seu primeiro evento</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/events/new">Novo Evento</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


