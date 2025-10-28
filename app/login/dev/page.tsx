"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { LogIn, Mail, Lock, ArrowLeft, Fish, Shield, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DevLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userType, setUserType] = useState<"admin" | "maricultor" | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setUserType(null)

    // Simulação de login para desenvolvimento
    setTimeout(() => {
      if (email === "admin@amesp.com" && password === "admin123") {
        setUserType("admin")
        setTimeout(() => {
          router.push("/admin/dev")
        }, 1000)
      } else if (email === "maricultor@teste.com" && password === "maricultor123") {
        setUserType("maricultor")
        setTimeout(() => {
          router.push("/maricultor/dashboard")
        }, 1000)
      } else {
        setError("Credenciais inválidas. Use: admin@amesp.com/admin123 ou maricultor@teste.com/maricultor123")
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
          <h1 className="text-2xl font-bold text-foreground mb-2">🔧 Modo Desenvolvimento</h1>
          <p className="text-muted-foreground">Teste sem dependência do Supabase</p>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Login de Desenvolvimento</CardTitle>
                <CardDescription>Use as credenciais de teste abaixo</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Credenciais de teste */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <h3 className="font-semibold text-sm mb-2">Credenciais de Teste:</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-medium">Admin:</span>
                  <span>admin@amesp.com / admin123</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Maricultor:</span>
                  <span>maricultor@teste.com / maricultor123</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {userType && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {userType === "admin" ? (
                    <Shield className="h-5 w-5" />
                  ) : (
                    <Users className="h-5 w-5" />
                  )}
                  <span className="font-semibold">
                    {userType === "admin" ? "Administrador" : "Maricultor"}
                  </span>
                </div>
                <p className="text-sm">
                  {userType === "admin" 
                    ? "Redirecionando para área administrativa..." 
                    : "Redirecionando para sua área pessoal..."
                  }
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                    placeholder="admin@amesp.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                    placeholder="admin123"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-border" disabled={loading} />
                  <span className="text-muted-foreground">Lembrar de mim</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-base font-semibold hover:scale-[1.02] transition-transform shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Entrando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Entrar</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Ainda não tem uma conta?{" "}
                <Link
                  href="/maricultor/cadastro"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Cadastre-se como maricultor
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            🔧 Modo de desenvolvimento - sem dependência do Supabase
          </p>
        </div>
      </div>
    </div>
  )
}
