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
      <div className="relative bg-white w-full max-w-7xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {event.banner_url ? (
          <div className="relative h-80 w-full overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.banner_url!} alt={event.title} className="h-full w-full object-cover block" />
          </div>
        ) : null}
        <button className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white transition-colors" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
        <div className="px-8 pt-8 pb-10 overflow-y-auto bg-gradient-to-b from-white to-slate-50 flex-1">
          <h2 className="text-3xl font-bold mb-3">{event.title}</h2>
          <div className="flex flex-wrap items-center gap-4 text-base text-slate-600 mb-6">
            {dateRange && (
              <span className="inline-flex items-center gap-2"><Calendar className="h-5 w-5" /> {dateRange}</span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-2"><MapPin className="h-5 w-5" /> {event.location}</span>
            )}
          </div>
          {(event.live_url || event.signup_url) && (
            <div className="flex flex-wrap gap-4 mb-8">
              {event.live_url && (
                <a href={event.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow text-base font-medium">
                  <Play className="h-5 w-5" /> Assistir ao vivo <ExternalLink className="h-5 w-5 opacity-80" />
                </a>
              )}
              {event.signup_url && (
                <a href={event.signup_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow text-base font-medium">
                  Inscrição <ExternalLink className="h-5 w-5 opacity-80" />
                </a>
              )}
            </div>
          )}
          {event.description && (
            <p className="text-lg text-slate-700 leading-relaxed mb-8 whitespace-pre-wrap">{event.description}</p>
          )}
          {Array.isArray(event.schedule) && event.schedule.length > 0 && (
            <div className="mt-2 space-y-6">
              {event.schedule.map((d, i) => {
                const dayDate = new Date(d.date)
                const dayName = dayDate.toLocaleDateString('pt-BR', { weekday: 'long' })
                const dayFormatted = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(dayDate)
                return (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-200">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {dayDate.getDate()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 capitalize text-xl">{dayName}</div>
                        <div className="text-base text-slate-600">{dayFormatted}</div>
                      </div>
                    </div>
                    <div className="space-y-5">
                      {d.items?.map((it, j) => (
                        <div key={j} className="flex gap-5 text-base relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-gradient-to-b before:from-primary/40 before:to-primary/60 before:rounded-full">
                          <div className="w-24 shrink-0 text-slate-700 font-semibold leading-7 pt-0.5">{it.time}</div>
                          {it.avatar_url && (
                            <div className="h-14 w-14 shrink-0 rounded-full border-2 border-primary/20 overflow-hidden bg-white shadow-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={it.avatar_url} alt={it.title} className="h-full w-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 break-words leading-7 text-base">{it.title}</div>
                            {it.description && (
                              <div className="text-slate-600 leading-6 mt-1.5 break-words text-sm">{it.description}</div>
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
            <div className="mt-12 pt-8 border-t-2 border-slate-200">
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-slate-900 font-bold text-2xl">Stands</h3>
              </div>
              <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-lg">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
                  {event.stands.map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 group">
                      <div className="relative h-24 w-24 rounded-full bg-white border-[3px] border-slate-300 p-4 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110 group-hover:border-primary/50 flex items-center justify-center">
                        {s.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.logo_url} alt={s.name || 'logo'} className="h-full w-full object-contain" />
                        ) : (
                          <Store className="h-10 w-10 text-slate-400" />
                        )}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 text-center leading-tight max-w-[100px]">{s.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {Array.isArray(event.participants) && event.participants.length > 0 && (
            <div className="mt-12 pt-8 border-t-2 border-slate-200">
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-slate-900 font-bold text-2xl">Participantes</h3>
              </div>
              <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-blue-50/50 to-white p-6 shadow-lg">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
                  {event.participants.map((p, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 group">
                      <div className="relative h-24 w-24 rounded-full bg-white border-3 border-slate-300 p-4 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110 group-hover:border-blue-500/50 flex items-center justify-center">
                        {p.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.logo_url} alt={p.name || 'logo'} className="h-full w-full object-contain" />
                        ) : (
                          <Users className="h-10 w-10 text-slate-400" />
                        )}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 text-center leading-tight max-w-[100px]">{p.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {Array.isArray(event.sponsors) && event.sponsors.length > 0 && (
            <div className="mt-12 pt-8 border-t-2 border-slate-200">
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Handshake className="h-6 w-6 text-emerald-700" />
                </div>
                <h3 className="text-slate-900 font-bold text-2xl">Patrocinadores</h3>
              </div>
              <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-emerald-50/50 to-white p-6 shadow-lg">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
                  {event.sponsors.map((p, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 group">
                      <div className="relative h-24 w-24 rounded-full bg-white border-3 border-slate-300 p-4 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110 group-hover:border-emerald-500/50 flex items-center justify-center">
                        {p.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.logo_url} alt={p.name || 'logo'} className="h-full w-full object-contain" />
                        ) : (
                          <Handshake className="h-10 w-10 text-slate-400" />
                        )}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 text-center leading-tight max-w-[100px]">{p.name}</div>
                    </div>
                  ))}
                </div>
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


