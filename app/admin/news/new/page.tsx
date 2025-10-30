"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function NewNewsPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null)
  }

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Informe um título")
    setLoading(true)
    try {
      const supabase = createClient()
      let image_url = null as string | null
      if (file) {
        const safeName = file.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9_.-]/g, '-')
        const path = `news/${Date.now()}-${safeName}`
        const { error: upErr } = await supabase.storage
          .from('news')
          .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' })
        if (upErr) throw upErr
        const { data } = supabase.storage.from('news').getPublicUrl(path)
        image_url = data.publicUrl
      }

      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, image_url, published: true })
      })
      if (!res.ok) {
        let msg = 'Falha ao salvar'
        try {
          const data = await res.json()
          if (data?.error) msg = data.error
        } catch {}
        throw new Error(msg)
      }
      toast.success('Notícia criada!')
      router.push('/admin/news')
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || 'Erro ao criar notícia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nova Notícia</h1>
      </div>
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50/30 to-teal-50/30 ring-1 ring-black/5 rounded-2xl">
        <CardHeader>
          <CardTitle>Informações</CardTitle>
          <CardDescription>Preencha os campos abaixo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Imagem</label>
            <Input type="file" accept="image/*" onChange={onFile} />
          </div>
          <div>
            <label className="text-sm font-medium">Texto da notícia</label>
            <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading} className="rounded-2xl px-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg hover:from-blue-700 hover:to-cyan-600">
              {loading ? 'Salvando...' : 'Publicar notícia'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
