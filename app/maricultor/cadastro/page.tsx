"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { UserPlus, Mail, Lock, User, Phone, MapPin, ArrowLeft, Fish } from "lucide-react"

export default function MaricultorCadastroPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    logradouro: "",
    cidade: "",
    estado: "",
    company: "",
    specialties: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const getSupabaseClient = () => {
    try {
      return createClient()
    } catch (err) {
      setError("Erro de configuração. Tente novamente mais tarde.")
      return null
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/maricultor/dashboard`,
          data: {
            name: formData.name,
            phone: formData.phone,
            location: formData.location,
            company: formData.company,
            specialties: formData.specialties,
            user_type: "maricultor",
          },
        },
      })

      if (error) {
        setError(error.message)
      } else {
        // Persistir perfil do maricultor
        const userId = data.user?.id
        if (userId) {
          try {
            await fetch('/api/maricultor/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: userId,
                full_name: formData.name,
                phone: formData.phone,
                logradouro: formData.logradouro,
                cidade: formData.cidade,
                estado: formData.estado,
                company: formData.company,
                specialties: formData.specialties,
              })
            })
          } catch (e) {
            // mantém fluxo mesmo se a criação do perfil falhar; pode ser reprocessado posteriormente
          }
        }
        setSuccess(true)
      }
    } catch (err) {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
          <CardContent className="text-center p-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Cadastro Realizado!</h2>
            <p className="text-muted-foreground mb-6">
              Enviamos um e-mail de confirmação para <strong>{formData.email}</strong>. Clique no link do e-mail para
              ativar sua conta.
            </p>
            <Button asChild className="w-full">
              <Link href="/maricultor/login">Ir para Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao site</span>
          </Link>
          <div className="flex justify-center mb-4">
            <Image src="/amesp_logo.png" alt="AMESP" width={120} height={40} className="h-12 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Cadastro de Maricultor</h1>
          <p className="text-muted-foreground">Junte-se à nossa comunidade de maricultores</p>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Fish className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Criar Conta</CardTitle>
                <CardDescription>Preencha seus dados para se cadastrar</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Nome Completo *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">E-mail *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Confirmar Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                      placeholder="Repita sua senha"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Logradouro</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      name="logradouro"
                      value={formData.logradouro}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                      placeholder="Rua, número e complemento"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Cidade</label>
                  <input
                    type="text"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                    placeholder="Ex: Ubatuba"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Estado</label>
                  <input
                    type="text"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                    placeholder="Ex: SP"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Empresa/Fazenda</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                  placeholder="Nome da sua empresa ou fazenda aquícola"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Especialidades</label>
                <textarea
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all h-24 resize-none placeholder:text-muted-foreground/60"
                  placeholder="Ex: Cultivo de ostras, mexilhões, vieiras..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="terms" className="rounded border-border" required />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  Concordo com os{" "}
                  <Link href="/termos" className="text-primary hover:text-primary/80">
                    termos de uso
                  </Link>{" "}
                  e{" "}
                  <Link href="/privacidade" className="text-primary hover:text-primary/80">
                    política de privacidade
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-base font-semibold hover:scale-[1.02] transition-transform shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Criando conta...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Criar Conta</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link
                  href="/maricultor/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Faça login aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
