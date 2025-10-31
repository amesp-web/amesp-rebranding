"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Link from "next/link"
import { X } from "lucide-react"

type ScheduleDay = { date: string; items: { time: string; title: string; description?: string; avatar_url?: string }[] }

export default function EditEventPage({ params }: { params: { id: string } }) {
  const id = params.id
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({ title: "", description: "", banner_url: "", photo_url: "", location: "", live_url: "", signup_url: "", published: false })
  const [schedule, setSchedule] = useState<ScheduleDay[]>([])
  const [stands, setStands] = useState<{ logo_url: string; name: string }[]>([])
  const [participants, setParticipants] = useState<{ logo_url: string; name: string }[]>([])
  const [sponsors, setSponsors] = useState<{ logo_url: string; name: string }[]>([])

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/events/${id}`, { cache: 'no-store' })
        const data = await res.json()
        setForm({
          title: data.title || '',
          description: data.description || '',
          banner_url: data.banner_url || '',
          photo_url: data.photo_url || '',
          location: data.location || '',
          live_url: data.live_url || '',
          signup_url: data.signup_url || '',
          published: !!data.published,
        })
        setSchedule(Array.isArray(data.schedule) ? data.schedule : [])
        setStands(Array.isArray(data.stands) ? data.stands : [])
        setParticipants(Array.isArray(data.participants) ? data.participants : [])
        setSponsors(Array.isArray(data.sponsors) ? data.sponsors : [])
      } catch {
        toast.error('Falha ao carregar evento')
      }
    })()
  }, [id])

  const onChange = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))
  const addDay = () => setSchedule((d) => [...d, { date: "", items: [] }])
  const addItem = (idx: number) => setSchedule((d) => d.map((day, i) => i === idx ? { ...day, items: [...day.items, { time: "", title: "", description: "", avatar_url: "" }] } : day))
  const setDay = (i: number, k: string, v: any) => setSchedule((d) => d.map((day, idx) => idx === i ? { ...day, [k]: v } : day))
  const setItem = (di: number, ii: number, k: string, v: any) => setSchedule((d) => d.map((day, idx) => idx === di ? { ...day, items: day.items.map((it, j) => j === ii ? { ...it, [k]: v } : it) } : day))
  const removeItem = (di: number, ii: number) => setSchedule((d) => d.map((day, idx) => idx === di ? { ...day, items: day.items.filter((_, j) => j !== ii) } : day))

  const upload = async (file: File) => {
    const safeName = file.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_.-]/g, '-')
    const path = `events/${Date.now()}-${safeName}`
    const { error } = await supabase.storage.from('events').upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' })
    if (error) throw error
    const { data } = supabase.storage.from('events').getPublicUrl(path)
    return data.publicUrl
  }

  const onSubmit = async () => {
    if (!form.title) return toast.error('Informe o título do evento')
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, schedule, stands, participants, sponsors }) })
      if (!res.ok) throw new Error(await res.text())
      toast.success('Evento atualizado!')
      window.location.href = '/admin/events'
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao atualizar evento')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar Evento</h1>
        <Button variant="outline" asChild><Link href="/admin/events">Voltar</Link></Button>
      </div>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20">
        <CardHeader>
          <CardTitle>Informações do Evento</CardTitle>
          <CardDescription>Atualize os campos abaixo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => onChange('title', e.target.value)} />
            </div>
            <div>
              <Label>Local (endereço)</Label>
              <Input value={form.location} onChange={(e) => onChange('location', e.target.value)} />
            </div>
            <div>
              <Label>Transmissão ao vivo (YouTube)</Label>
              <Input value={form.live_url} onChange={(e) => onChange('live_url', e.target.value)} placeholder="https://youtube.com/..." />
            </div>
            <div>
              <Label>Inscrição (Google Forms)</Label>
              <Input value={form.signup_url} onChange={(e) => onChange('signup_url', e.target.value)} placeholder="https://forms.gle/..." />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch id="published" checked={!!form.published} onCheckedChange={(v) => onChange('published', v)} />
              <Label htmlFor="published">Publicar imediatamente</Label>
            </div>
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea rows={6} value={form.description} onChange={(e) => onChange('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Banner do evento</Label>
              <Input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const url = await upload(f); onChange('banner_url', url) } }} />
              {form.banner_url && <img src={form.banner_url} className="mt-2 h-28 object-cover rounded" />}
            </div>
            <div>
              <Label>Foto</Label>
              <Input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const url = await upload(f); onChange('photo_url', url) } }} />
              {form.photo_url && <img src={form.photo_url} className="mt-2 h-28 object-cover rounded" />}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Cronograma</CardTitle>
          <CardDescription>Atualize os dias e atrações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={addDay}>Adicionar dia</Button>
          {schedule.map((day, di) => (
            <div key={di} className="rounded-xl border p-4 space-y-3 bg-white/60">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-1">
                  <Label>Data</Label>
                  <Input type="date" value={day.date} onChange={(e) => setDay(di, 'date', e.target.value)} />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button variant="outline" onClick={() => addItem(di)}>Adicionar atração</Button>
                </div>
              </div>
              <div className="space-y-3">
                {day.items.map((it, ii) => (
                  <div key={ii} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start relative">
                    <div className="md:col-span-1">
                      <Label>Hora</Label>
                      <Input placeholder="HH:MM" value={it.time} onChange={(e) => setItem(di, ii, 'time', e.target.value)} />
                    </div>
                    <div className="md:col-span-1 flex flex-col items-center">
                      <Label className="mb-1">Avatar</Label>
                      <label className="cursor-pointer">
                        <div className="h-12 w-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
                          {it.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={it.avatar_url} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                          ) : (
                            <span className="text-slate-400 text-xs">+</span>
                          )}
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0]
                            if (f) {
                              try {
                                const url = await upload(f)
                                setItem(di, ii, 'avatar_url', url)
                              } catch {
                                toast.error('Falha ao enviar imagem')
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className="md:col-span-4">
                      <Label>Tema</Label>
                      <Input value={it.title} onChange={(e) => setItem(di, ii, 'title', e.target.value)} />
                    </div>
                    <div className="md:col-span-5">
                      <Label>Descrição</Label>
                      <Input value={it.description || ''} onChange={(e) => setItem(di, ii, 'description', e.target.value)} />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeItem(di, ii)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {[{ title: 'Stands', state: stands, set: setStands }, { title: 'Participantes', state: participants, set: setParticipants }, { title: 'Patrocinadores', state: sponsors, set: setSponsors }].map((blk, idx) => (
        <Card key={idx} className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>{blk.title}</CardTitle>
            <CardDescription>Envie a logo e o nome</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" onClick={() => blk.set((arr: any[]) => [...arr, { logo_url: '', name: '' }])}>Adicionar</Button>
            {blk.state.map((it: any, i: number) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                <div className="md:col-span-2">
                  <Label>Logo</Label>
                  <Input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { const url = await upload(f); blk.set((arr: any[]) => arr.map((x, idx) => idx === i ? { ...x, logo_url: url } : x)) } catch { toast.error('Falha ao enviar logo') } } }} />
                  {it.logo_url && <img src={it.logo_url} className="mt-2 h-14 object-contain rounded bg-white" />}
                </div>
                <div className="md:col-span-4">
                  <Label>Nome</Label>
                  <Input value={it.name} onChange={(e) => blk.set((arr: any[]) => arr.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end gap-3">
        <Button variant="outline" asChild><Link href="/admin/events">Cancelar</Link></Button>
        <Button onClick={onSubmit} disabled={loading}>{loading ? 'Salvando...' : 'Salvar alterações'}</Button>
      </div>
    </div>
  )
}


