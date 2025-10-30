"use client"

import { useEffect, useMemo, useState } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import EventsReaderModal, { type PublicEvent } from './EventsReaderModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'

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

export default function HomeEventsSection() {
  const [events, setEvents] = useState<PublicEvent[]>([])
  const [selected, setSelected] = useState<PublicEvent | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/public/events', { cache: 'no-store' })
        let data = await res.json()
        if ((!data || data.length === 0) && process.env.NEXT_PUBLIC_BASE_URL) {
          const res2 = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/public/events`, { cache: 'no-store' })
          data = await res2.json()
        }
        if (mounted) setEvents(Array.isArray(data) ? data : [])
      } catch {
        // noop
      }
    })()
    return () => { mounted = false }
  }, [])

  const first = events[0]
  const dateRange = useMemo(() => formatDateRange(first?.schedule as any[]), [first])

  // Header + Card NO MESMO LAYOUT original da Home (mantendo visual)
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

      <Card className="max-w-4xl mx-auto overflow-hidden border-0 shadow-xl">
        <div className="grid md:grid-cols-2">
          <div className="relative h-64 md:h-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={(first?.banner_url) || "/professional-conference-room-with-aquaculture-expe.jpg"}
              alt={first?.title || 'Workshop Nacional da Maricultura'}
              className="w-full h-full object-cover block"
            />
          </div>
          <CardContent className="p-8 flex flex-col justify-center bg-gradient-to-br from-card to-card/50">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit bg-primary/10 border-primary text-primary font-medium">
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange || '30 de Agosto a 1 de Setembro de 2024'}
              </Badge>
              <CardTitle className="text-2xl font-sans">{first?.title || 'I Workshop Nacional da Maricultura'}</CardTitle>
              <CardDescription className="text-base">
                <div className="flex items-center mb-2">
                  <MapPin className="mr-2 h-4 w-4" />
                  {first?.location || 'Ubatuba - SP'}
                </div>
                {(first?.description ? truncate(first.description, 50) : 'Um evento único para discutir o futuro da maricultura brasileira, com palestras, workshops práticos e networking entre profissionais do setor.')} 
              </CardDescription>
              <Button className="w-fit hover:scale-105 transition-transform" onClick={() => first && setSelected(first)}>Saiba Mais</Button>
            </div>
          </CardContent>
        </div>
      </Card>

      <EventsReaderModal event={selected} open={!!selected} onClose={() => setSelected(null)} />
    </>
  )
}


