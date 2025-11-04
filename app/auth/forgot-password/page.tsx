"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Por favor, digite seu email")
      return
    }

    if (!validateEmail(email)) {
      setError("Por favor, digite um email válido")
      return
    }

    setLoading(true)

    try {
      // Usar a API própria do sistema ao invés do Supabase Auth
      const response = await fetch('/api/auth/request-reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Erro ao enviar email:", data.error)
        // Por segurança, não revelar se email existe ou não
        setSuccess(true)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      console.error("Erro inesperado:", err)
      // Por segurança, sempre mostrar sucesso
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image src="/amesp_logo.png" alt="AMESP" width={120} height={40} className="h-12 w-auto" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Email Enviado!</h1>
            <p className="text-muted-foreground">Verifique sua caixa de entrada</p>
          </div>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Sucesso!</h2>
                <p className="text-muted-foreground mb-4">
                  Se o email <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
                </p>
                <p className="text-sm text-muted-foreground">
                  Verifique sua caixa de entrada e também a pasta de spam.
                </p>
              </div>

              <Link href="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao login</span>
          </Link>
          <div className="flex justify-center mb-4">
            <Image src="/amesp_logo.png" alt="AMESP" width={120} height={40} className="h-12 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Esqueceu sua senha?</h1>
          <p className="text-muted-foreground">Digite seu email para receber instruções de redefinição</p>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Recuperar Acesso</CardTitle>
            <CardDescription>
              Enviaremos um link seguro para seu email
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email cadastrado
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                    className="w-full pl-10 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                    placeholder="seu@email.com"
                    required
                    autoFocus
                  />
                </div>
                {error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Info de Segurança */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 font-medium mb-1">Proteção de privacidade</p>
                    <p className="text-xs text-blue-700">
                      Por segurança, confirmaremos o envio mesmo que o email não esteja cadastrado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão Enviar */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-base font-semibold hover:scale-[1.02] transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Enviando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Enviar Link de Recuperação</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Links úteis */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Lembrou sua senha?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Fazer login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

