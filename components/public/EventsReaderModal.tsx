"use client"

import { useEffect, useMemo, useState } from 'react'
import { X, MapPin, Calendar, ExternalLink, Play, Users, Store, Handshake } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ScheduleDay = { date: string; items: { time: string; title: string; description?: string; avatar_url?: string }[] }

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
            <div className="mt-2 space-y-6">
              {event.schedule.map((d, i) => {
                const dayDate = new Date(d.date)
                const dayName = dayDate.toLocaleDateString('pt-BR', { weekday: 'long' })
                const dayFormatted = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(dayDate)
                return (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-base shadow-md">
                        {dayDate.getDate()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 capitalize text-lg">{dayName}</div>
                        <div className="text-sm text-slate-600">{dayFormatted}</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {d.items?.map((it, j) => (
                        <div key={j} className="flex gap-4 text-sm relative pl-3 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-primary/40 before:to-primary/60 before:rounded-full">
                          <div className="w-20 shrink-0 text-slate-700 font-semibold leading-6 pt-0.5">{it.time}</div>
                          {it.avatar_url && (
                            <div className="h-12 w-12 shrink-0 rounded-full border-2 border-primary/20 overflow-hidden bg-white shadow-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={it.avatar_url} alt={it.title} className="h-full w-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 break-words leading-6">{it.title}</div>
                            {it.description && (
                              <div className="text-slate-600 leading-5 mt-1 break-words text-xs">{it.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {Array.isArray(event.stands) && event.stands.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-5 text-slate-800 font-semibold text-lg"><Store className="h-5 w-5" /> Stands</div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5">
                {event.stands.map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group">
                    <div className="relative h-20 w-20 rounded-full bg-white border-2 border-slate-200 p-3 shadow-md group-hover:shadow-lg transition-all group-hover:scale-110 group-hover:border-primary/40 flex items-center justify-center">
                      {s.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.logo_url} alt={s.name || 'logo'} className="h-full w-full object-contain" />
                      ) : (
                        <Store className="h-8 w-8 text-slate-400" />
                      )}
                    </div>
                    <div className="text-xs font-medium text-slate-800 text-center leading-tight max-w-[80px]">{s.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {Array.isArray(event.participants) && event.participants.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-5 text-slate-800 font-semibold text-lg"><Users className="h-5 w-5" /> Participantes</div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5">
                {event.participants.map((p, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group">
                    <div className="relative h-20 w-20 rounded-full bg-white border-2 border-slate-200 p-3 shadow-md group-hover:shadow-lg transition-all group-hover:scale-110 group-hover:border-primary/40 flex items-center justify-center">
                      {p.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.logo_url} alt={p.name || 'logo'} className="h-full w-full object-contain" />
                      ) : (
                        <Users className="h-8 w-8 text-slate-400" />
                      )}
                    </div>
                    <div className="text-xs font-medium text-slate-800 text-center leading-tight max-w-[80px]">{p.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {Array.isArray(event.sponsors) && event.sponsors.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-5 text-slate-800 font-semibold text-lg"><Handshake className="h-5 w-5" /> Patrocinadores</div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5">
                {event.sponsors.map((p, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group">
                    <div className="relative h-20 w-20 rounded-full bg-white border-2 border-slate-200 p-3 shadow-md group-hover:shadow-lg transition-all group-hover:scale-110 group-hover:border-primary/40 flex items-center justify-center">
                      {p.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.logo_url} alt={p.name || 'logo'} className="h-full w-full object-contain" />
                      ) : (
                        <Handshake className="h-8 w-8 text-slate-400" />
                      )}
                    </div>
                    <div className="text-xs font-medium text-slate-800 text-center leading-tight max-w-[80px]">{p.name}</div>
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


