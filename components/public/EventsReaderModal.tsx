"use client"

import { useEffect, useMemo, useState } from 'react'
import { X, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ScheduleDay = { date: string; items: { time: string; title: string; description?: string }[] }

export type PublicEvent = {
  id: string
  title: string
  description?: string | null
  banner_url?: string | null
  image_url?: string | null
  location?: string | null
  schedule?: ScheduleDay[] | null
}

function formatDateRange(schedule?: ScheduleDay[] | null) {
  if (!schedule || schedule.length === 0) return ''
  const parse = (value: string) => {
    const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value))
    if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]))
    const iso = new Date(value)
    if (!isNaN(iso.getTime())) return iso
    const m = /^([0-3]?\d)\/([0-1]?\d)\/(\d{4})$/.exec(String(value))
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
    return new Date('')
  }
  const dates = schedule.map(d => parse(d.date)).filter(d => !isNaN(d.getTime()))
  if (dates.length === 0) return ''
  const min = new Date(Math.min(...dates.map(d => d.getTime())))
  const max = new Date(Math.max(...dates.map(d => d.getTime())))
  const fmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const start = fmt.format(min)
  const end = fmt.format(max)
  return start === end ? start : `${start} a ${end}`
}

export default function EventsReaderModal({ event, open, onClose }: { event: PublicEvent | null; open: boolean; onClose: () => void }) {
  const [visible, setVisible] = useState(open)
  useEffect(() => setVisible(open), [open])

  const dateRange = useMemo(() => formatDateRange(event?.schedule || []), [event])

  if (!visible || !event) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl">
        {event.banner_url || event.image_url ? (
          <div className="relative h-60 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={(event.banner_url || event.image_url)!} alt={event.title} className="h-full w-full object-cover block" />
            <button className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        )}
        <div className="px-6 pt-5 pb-6 max-h-[70vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-4">
            {dateRange && (
              <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {dateRange}</span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {event.location}</span>
            )}
          </div>
          {event.description && (
            <p className="text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">{event.description}</p>
          )}
          {Array.isArray(event.schedule) && event.schedule.length > 0 && (
            <div className="mt-2 space-y-4">
              {event.schedule.map((d, i) => (
                <div key={i} className="rounded-xl border p-4">
                  <div className="font-medium mb-2">{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(d.date))}</div>
                  <div className="space-y-2">
                    {d.items?.map((it, j) => (
                      <div key={j} className="flex gap-3 text-sm">
                        <div className="w-16 text-slate-500">{it.time}</div>
                        <div className="font-medium">{it.title}</div>
                        {it.description && <div className="text-slate-600">— {it.description}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}


