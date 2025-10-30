"use client"

import { useEffect, useMemo, useState } from 'react'
import { X, MapPin, Calendar, ExternalLink, Play, Users, Store, Handshake } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ScheduleDay = { date: string; items: { time: string; title: string; description?: string }[] }

export type PublicEvent = {
  id: string
  title: string
  description?: string | null
  banner_url?: string | null
  location?: string | null
  schedule?: ScheduleDay[] | null
  stands?: { logo_url?: string; name?: string }[] | null
  participants?: { logo_url?: string; name?: string }[] | null
  sponsors?: { logo_url?: string; name?: string }[] | null
  live_url?: string | null
  signup_url?: string | null
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
      <div className="relative bg-white w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl">
        {event.banner_url ? (
          <div className="relative h-72 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.banner_url!} alt={event.title} className="h-full w-full object-cover block" />
            <button className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        )}
        <div className="px-7 pt-6 pb-8 max-h-[78vh] overflow-y-auto bg-gradient-to-b from-white to-slate-50">
          <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-4">
            {dateRange && (
              <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {dateRange}</span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {event.location}</span>
            )}
          </div>
          {(event.live_url || event.signup_url) && (
            <div className="flex flex-wrap gap-3 mb-6">
              {event.live_url && (
                <a href={event.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow">
                  <Play className="h-4 w-4" /> Assistir ao vivo <ExternalLink className="h-4 w-4 opacity-80" />
                </a>
              )}
              {event.signup_url && (
                <a href={event.signup_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow">
                  Inscrição <ExternalLink className="h-4 w-4 opacity-80" />
                </a>
              )}
            </div>
          )}
          {event.description && (
            <p className="text-slate-700 leading-relaxed mb-6 whitespace-pre-wrap">{event.description}</p>
          )}
          {Array.isArray(event.schedule) && event.schedule.length > 0 && (
            <div className="mt-2 space-y-4">
              {event.schedule.map((d, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="font-medium mb-2">{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(d.date))}</div>
                  <div className="space-y-3">
                    {d.items?.map((it, j) => (
                      <div key={j} className="flex gap-4 text-sm">
                        <div className="w-16 shrink-0 text-slate-500 font-medium leading-6 pt-0.5">{it.time}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 break-words leading-6">{it.title}</div>
                          {it.description && (
                            <div className="text-slate-600 leading-5 mt-0.5 break-words">{it.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {Array.isArray(event.stands) && event.stands.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold"><Store className="h-4 w-4" /> Stands</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {event.stands.map((s, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 p-3 flex items-center gap-3 bg-white/90 shadow-sm hover:shadow-md transition-shadow">
                    {s.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logo_url} alt={s.name || 'logo'} className="h-12 w-12 object-contain bg-white rounded" />
                    )}
                    <div className="text-sm font-medium text-slate-800">{s.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {Array.isArray(event.participants) && event.participants.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold"><Users className="h-4 w-4" /> Participantes</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {event.participants.map((p, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 p-3 flex items-center gap-3 bg-white/90 shadow-sm hover:shadow-md transition-shadow">
                    {p.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.logo_url} alt={p.name || 'logo'} className="h-12 w-12 object-contain bg-white rounded" />
                    )}
                    <div className="text-sm font-medium text-slate-800">{p.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {Array.isArray(event.sponsors) && event.sponsors.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold"><Handshake className="h-4 w-4" /> Patrocinadores</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {event.sponsors.map((p, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 p-3 flex items-center gap-3 bg-white/90 shadow-sm hover:shadow-md transition-shadow">
                    {p.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.logo_url} alt={p.name || 'logo'} className="h-12 w-12 object-contain bg-white rounded" />
                    )}
                    <div className="text-sm font-medium text-slate-800">{p.name}</div>
                  </div>
                ))}
              </div>
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


