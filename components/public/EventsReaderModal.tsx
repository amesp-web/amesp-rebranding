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
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 md:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-[95vw] md:max-w-[90rem] max-h-[95vh] rounded-xl md:rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {event.banner_url ? (
          <div className="relative h-48 md:h-80 w-full overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.banner_url!} alt={event.title} className="h-full w-full object-cover block" />
          </div>
        ) : null}
        <button className="absolute top-2 right-2 md:top-4 md:right-4 z-10 h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white transition-colors" onClick={onClose}>
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </button>
        <div className="px-4 md:px-8 pt-4 md:pt-8 pb-6 md:pb-10 overflow-y-auto bg-gradient-to-b from-white to-slate-50 flex-1">
          <h2 className="text-xl md:text-3xl font-bold mb-3 break-words">{event.title}</h2>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 md:gap-4 text-sm md:text-base text-slate-600 mb-4 md:mb-6">
            {dateRange && (
              <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" /> <span className="break-words">{dateRange}</span></span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" /> <span className="break-words">{event.location}</span></span>
            )}
          </div>
          {(event.live_url || event.signup_url) && (
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 mb-6 md:mb-8">
              {event.live_url && (
                <a href={event.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow text-sm md:text-base font-medium">
                  <Play className="h-4 w-4 md:h-5 md:w-5" /> Assistir ao vivo <ExternalLink className="h-4 w-4 md:h-5 md:w-5 opacity-80" />
                </a>
              )}
              {event.signup_url && (
                <a href={event.signup_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow text-sm md:text-base font-medium">
                  Inscrição <ExternalLink className="h-4 w-4 md:h-5 md:w-5 opacity-80" />
                </a>
              )}
            </div>
          )}
          {event.description && (
            <p className="text-sm md:text-lg text-slate-700 leading-relaxed mb-6 md:mb-8 whitespace-pre-wrap break-words">{event.description}</p>
          )}
          {Array.isArray(event.schedule) && event.schedule.length > 0 && (
            <div className="mt-2 space-y-6">
              {event.schedule.map((d, i) => {
                const dayDate = new Date(d.date)
                const dayName = dayDate.toLocaleDateString('pt-BR', { weekday: 'long' })
                const dayFormatted = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(dayDate)
                return (
                  <div key={i} className="rounded-xl md:rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5 pb-3 md:pb-4 border-b border-slate-200">
                      <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-base md:text-lg shadow-md flex-shrink-0">
                        {dayDate.getDate()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 capitalize text-base md:text-xl break-words">{dayName}</div>
                        <div className="text-sm md:text-base text-slate-600 break-words">{dayFormatted}</div>
                      </div>
                    </div>
                    <div className="space-y-4 md:space-y-5">
                      {d.items?.map((it, j) => (
                        <div key={j} className="flex flex-col sm:flex-row gap-3 md:gap-5 text-sm md:text-base relative pl-3 md:pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 md:before:w-1.5 before:bg-gradient-to-b before:from-primary/40 before:to-primary/60 before:rounded-full">
                          <div className="w-full sm:w-20 md:w-24 shrink-0 text-slate-700 font-semibold leading-6 md:leading-7 pt-0.5">{it.time}</div>
                          <div className="flex gap-3 md:gap-5 flex-1 min-w-0">
                            {it.avatar_url && (
                              <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-full border-2 md:border-3 border-primary/20 overflow-hidden bg-white shadow-md">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={it.avatar_url} alt={it.title} className="h-full w-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-900 break-words leading-6 md:leading-7 text-sm md:text-base">{it.title}</div>
                              {it.description && (
                                <div className="text-slate-600 leading-5 md:leading-6 mt-1 md:mt-1.5 break-words text-xs md:text-sm">{it.description}</div>
                              )}
                            </div>
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
              <div className="flex items-center gap-4 mb-8 px-2">
                <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
                  <Store className="h-7 w-7 text-white" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
                </div>
                <h3 className="text-slate-900 font-bold text-2xl">Stands</h3>
              </div>
              <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-lg">
                <div className="flex flex-wrap justify-center gap-6">
                  {event.stands.map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 group">
                      <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-white to-slate-50 border-[3px] border-slate-300 p-4 shadow-lg group-hover:shadow-xl group-hover:shadow-primary/30 transition-all group-hover:scale-110 group-hover:border-primary/50 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
              <div className="flex items-center gap-4 mb-8 px-2">
                <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Users className="h-7 w-7 text-white" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
                </div>
                <h3 className="text-slate-900 font-bold text-2xl">Participantes</h3>
              </div>
              <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-blue-50/50 to-white p-6 shadow-lg">
                <div className="flex flex-wrap justify-center gap-6">
                  {event.participants.map((p, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 group">
                      <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-white to-slate-50 border-[3px] border-slate-300 p-4 shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all group-hover:scale-110 group-hover:border-blue-500/50 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
              <div className="flex items-center gap-4 mb-8 px-2">
                <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Handshake className="h-7 w-7 text-white" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
                </div>
                <h3 className="text-slate-900 font-bold text-2xl">Patrocinadores</h3>
              </div>
              <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-emerald-50/50 to-white p-6 shadow-lg">
                <div className="flex flex-wrap justify-center gap-6">
                  {event.sponsors.map((p, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 group">
                      <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-white to-slate-50 border-[3px] border-slate-300 p-4 shadow-lg group-hover:shadow-xl group-hover:shadow-emerald-500/30 transition-all group-hover:scale-110 group-hover:border-emerald-500/50 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
        </div>
      </div>
    </div>
  )
}


