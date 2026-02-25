"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    newsletter: false
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    // Aplicar máscara de telefone
    if (name === 'phone') {
      const onlyDigits = value.replace(/\D/g, '')
      let masked = onlyDigits
      
      // Máscara: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
      if (onlyDigits.length <= 10) {
        // Telefone fixo: (XX) XXXX-XXXX
        masked = onlyDigits
          .slice(0, 10)
          .replace(/(\d{2})(\d{0,4})(\d{0,4})/, (_, ddd, part1, part2) => {
            if (part2) return `(${ddd}) ${part1}-${part2}`
            if (part1) return `(${ddd}) ${part1}`
            if (ddd) return `(${ddd}`
            return ''
          })
      } else {
        // Celular: (XX) XXXXX-XXXX
        masked = onlyDigits
          .slice(0, 11)
          .replace(/(\d{2})(\d{5})(\d{0,4})/, (_, ddd, part1, part2) => {
            if (part2) return `(${ddd}) ${part1}-${part2}`
            if (part1) return `(${ddd}) ${part1}`
            return `(${ddd}`
          })
      }
      
      setFormData(prev => ({
        ...prev,
        phone: masked
      }))
      return
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Por favor, digite um email válido")
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        toast.success("Mensagem enviada com sucesso!")
        
        // Resetar formulário após 3 segundos
        setTimeout(() => {
          setFormData({
            name: "",
            email: "",
            phone: "",
            company: "",
            message: "",
            newsletter: false
          })
          setSuccess(false)
        }, 3000)
      } else {
        toast.error(data.error || "Erro ao enviar mensagem. Tente novamente.")
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">Mensagem Enviada!</h3>
          <p className="text-muted-foreground mb-2">
            Recebemos sua mensagem e entraremos em contato em breve.
          </p>
          <p className="text-sm text-muted-foreground">
            Responderemos em até 24 horas úteis.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
      <CardHeader className="pb-6 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Envie uma mensagem</CardTitle>
            <CardDescription className="text-base">
              Preencha o formulário abaixo e entraremos em contato em breve.
            </CardDescription>
          </div>
        </div>

        {/* Contact info inline */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-primary" />
            <span>(12) 98800-5883</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-primary" />
            <span>amesp@amespmaricultura.org.br</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Ubatuba - SP, Brasil</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Nome Completo *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/60"
                placeholder="Digite seu nome completo"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">E-mail *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/60"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Telefone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/60"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Empresa/Organização</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/60"
                placeholder="Nome da sua empresa"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Mensagem *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all h-40 resize-none placeholder:text-muted-foreground/60"
              placeholder="Descreva detalhadamente como podemos ajudá-lo. Inclua informações relevantes sobre seu projeto ou necessidade..."
              required
            ></textarea>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="newsletter"
              name="newsletter"
              checked={formData.newsletter}
              onChange={handleChange}
              className="rounded border-border"
            />
            <label htmlFor="newsletter" className="text-sm text-muted-foreground">
              Desejo receber newsletters e atualizações sobre maricultura
            </label>
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-base font-semibold bg-gradient-to-r from-[#023299] to-cyan-500 hover:from-[#023299]/90 hover:to-cyan-500/90 text-white hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Enviando...</span>
              </div>
            ) : (
              'Enviar Mensagem'
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            * Campos obrigatórios. Responderemos em até 24 horas úteis.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

