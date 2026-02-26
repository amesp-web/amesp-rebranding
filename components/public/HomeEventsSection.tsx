"use client"

import { useEffect, useMemo, useState } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import EventsReaderModal, { type PublicEvent } from './EventsReaderModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

function parseDateFlexible(value: string) {
  // YYYY-MM-DD (tratar como data local, sem fuso)
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value))
  if (ymd) {
    const y = Number(ymd[1])
    const m = Number(ymd[2]) - 1
    const d = Number(ymd[3])
    const dt = new Date(y, m, d)
    if (!isNaN(dt.getTime())) return dt
  }
  // Tenta Date nativo (pode conter timezone explícito)
  const iso = new Date(value)
  if (!isNaN(iso.getTime())) return iso
  const m = /^([0-3]?\d)\/([0-1]?\d)\/(\d{4})$/.exec(String(value))
  if (m) {
    const d = Number(m[1])
    const mo = Number(m[2]) - 1
    const y = Number(m[3])
    const dt = new Date(y, mo, d)
    if (!isNaN(dt.getTime())) return dt
  }
  return null
}

function formatDateRange(schedule?: any[]) {
  if (!Array.isArray(schedule) || schedule.length === 0) return ''
  const dates = schedule
    .map((d: any) => parseDateFlexible(d.date))
    .filter((d: Date | null) => d && !isNaN(d.getTime())) as Date[]
  if (dates.length === 0) return ''
  const min = new Date(Math.min(...dates.map((d: Date) => d.getTime())))
  const max = new Date(Math.max(...dates.map((d: Date) => d.getTime())))
  const fmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const s = fmt.format(min)
  const e = fmt.format(max)
  return s === e ? s : `${s} a ${e}`
}

function truncate(text?: string | null, max = 50) {
  if (!text) return ''
  const t = text.trim()
  return t.length <= max ? t : t.slice(0, max).trimEnd() + '...'
}

export default function HomeEventsSection({ initialEvents = [] }: { initialEvents?: PublicEvent[] }) {
  const [events, setEvents] = useState<PublicEvent[]>(initialEvents)
  const [selected, setSelected] = useState<PublicEvent | null>(null)

  // 🚀 OTIMIZAÇÃO: apenas busca na API se o server NÃO enviou nada (initialEvents undefined/null).
  // Se o server disser \"lista vazia\", respeitamos isso e mostramos o estado vazio.
  useEffect(() => {
    if (initialEvents !== undefined && initialEvents !== null) {
      // Já temos a fonte da verdade (inclusive lista vazia)
      setEvents(initialEvents)
      return
    }

    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/public/events', { cache: 'no-store' })
        const data = await res.json()
        if (mounted) setEvents(Array.isArray(data) ? data : [])
      } catch {
        // noop
      }
    })()
    return () => { mounted = false }
  }, [initialEvents])

  // Header + Carrossel NO MESMO LAYOUT original da Home (mantendo visual)
  return (
    <>
      <div className="text-center space-y-4 mb-16">
        <Badge variant="outline" className="w-fit mx-auto">
          Eventos
        </Badge>
        <h2 className="font-sans font-bold text-3xl lg:text-4xl text-balance">
          Próximos Eventos
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          Fique atualizado sobre os eventos de maricultura do país, reunindo especialistas, produtores e pesquisadores.
        </p>
      </div>

      {events.length > 0 ? (
        <Carousel className="max-w-4xl mx-auto">
          <CarouselContent>
            {events.map((event) => {
              const dateRange = formatDateRange(event?.schedule as any[])
              return (
                <CarouselItem key={event.id}>
                  <Card className="overflow-hidden border-0 shadow-xl">
                    <div className="grid md:grid-cols-2">
                      <div className="relative h-64 md:h-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={event.banner_url || "/professional-conference-room-with-aquaculture-expe.jpg"}
                          alt={event.title || 'Workshop Nacional da Maricultura'}
                          className="w-full h-full object-cover block"
                        />
                      </div>
                      <CardContent className="p-8 flex flex-col justify-center bg-gradient-to-br from-card to-card/50">
                        <div className="space-y-4">
                          <Badge variant="secondary" className="w-fit bg-primary/10 border-primary text-primary font-medium">
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateRange || 'Data a definir'}
                          </Badge>
                          <CardTitle className="text-2xl font-sans">{event.title || 'Evento'}</CardTitle>
                          <CardDescription className="text-base">
                            <div className="flex items-center mb-2">
                              <MapPin className="mr-2 h-4 w-4" />
                              {event.location || 'Local a definir'}
                            </div>
                            {truncate(event.description, 50) || 'Descrição do evento...'} 
                          </CardDescription>
                          <Button className="w-fit bg-gradient-to-r from-[#023299] to-cyan-500 hover:from-[#023299]/90 hover:to-cyan-500/90 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200" onClick={() => setSelected(event)}>Saiba Mais</Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          {events.length > 1 && (
            <>
              <CarouselPrevious className="left-2 md:left-[-3rem] bg-white/90 hover:bg-white shadow-lg border-2" />
              <CarouselNext className="right-2 md:right-[-3rem] bg-white/90 hover:bg-white shadow-lg border-2" />
            </>
          )}
        </Carousel>
      ) : (
        <Card className="max-w-3xl mx-auto border-dashed border-2 border-muted-foreground/30 bg-muted/10">
          <CardContent className="py-12 text-center space-y-4">
            <Badge variant="secondary" className="bg-primary/10 border-primary text-primary font-medium">
              Em breve
            </Badge>
            <CardTitle className="text-2xl font-sans">
              Estamos preparando novidades para você
            </CardTitle>
            <CardDescription className="text-base max-w-xl mx-auto">
              No momento não há eventos publicados. Em breve divulgaremos novas atividades e encontros da maricultura.
            </CardDescription>
          </CardContent>
        </Card>
      )}

      <EventsReaderModal event={selected} open={!!selected} onClose={() => setSelected(null)} />
    </>
  )
}


