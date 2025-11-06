"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { LogIn, Mail, Lock, ArrowLeft, Fish, Shield, Users, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { checkTemporaryPassword } from "@/lib/auth-helpers"
import { useSearchParams } from "next/navigation"
import { lazy, Suspense } from "react"

// Lazy load do FishLoading para melhor performance
const LazyFishLoading = lazy(() => import("@/components/ui/fish-loading").then(module => ({ default: module.FishLoading })))

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userType, setUserType] = useState<"admin" | "maricultor" | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verificar se há erro de conta inativa
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'account_inactive') {
      setError("Sua conta foi inativada. Entre em contato com o administrador.")
    }
    // Não limpar o erro automaticamente para não interferir com outros erros
  }, [searchParams])

  // 🚀 OTIMIZAÇÃO: Prefetch das rotas de destino para navegação instantânea
  useEffect(() => {
    router.prefetch('/admin')
    router.prefetch('/maricultor/dashboard')
  }, [router])

  const getSupabaseClient = useCallback(() => {
    try {
      return createClient()
    } catch (err) {
      setError("Erro de configuração. Tente novamente mais tarde.")
      return null
    }
  }, [])

  const translateErrorMessage = useCallback((errorMessage: string): string => {
    const translations: { [key: string]: string } = {
      "Invalid login credentials": "Credenciais de login inválidas",
      "Email not confirmed": "E-mail não confirmado",
      "Too many requests": "Muitas tentativas. Tente novamente mais tarde",
      "User not found": "Usuário não encontrado",
      "Invalid email": "E-mail inválido",
      "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres",
      "Unable to validate email address: invalid format": "Formato de e-mail inválido",
      "Signup requires a valid password": "É necessário uma senha válida para cadastro",
      "User already registered": "Usuário já cadastrado"
    }
    
    return translations[errorMessage] || errorMessage
  }, [])

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setUserType(null)

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(translateErrorMessage(error.message))
        setLoading(false)
        return
      }

      if (data.user) {
        // Verificar se é senha temporária
        const isTemporaryPassword = password.length === 8 && password === password.toUpperCase() && /^[A-Z0-9]+$/.test(password)
        
        if (isTemporaryPassword) {
          // Redirecionar para redefinição de senha
          router.push(`/reset-password?email=${encodeURIComponent(email)}`)
          return
        }

        // Check if user is admin - query otimizada apenas com campos necessários
        const { data: adminProfile } = await supabase
          .from("admin_profiles")
          .select("id, is_active")
          .eq("id", data.user.id)
          .single()

        if (adminProfile) {
          // Verificar se o usuário está ativo ANTES de permitir login
          if (adminProfile.is_active === false) {
            console.log('🚫 Usuário inativo tentando fazer login:', email)
            setError("Sua conta foi inativada. Entre em contato com o administrador.")
            setLoading(false)
            return
          }
          
          // 🚀 OTIMIZAÇÃO: Atualizar último acesso em background (não bloqueia login)
          supabase
            .from("admin_profiles")
            .update({ 
              last_sign_in_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq("id", data.user.id)
            .then(({ error }) => {
              if (error) {
                console.error('⚠️ Erro ao atualizar último acesso (não crítico):', error)
              }
            })
          
          setUserType("admin")
          // 🚀 OTIMIZAÇÃO: Reduzido para 100ms (rápido mas ainda mostra feedback)
          setTimeout(() => {
            router.push("/admin")
          }, 100)
        } else {
          // Verificar maricultor profile e status
          const { data: maricultorProfile } = await supabase
            .from('maricultor_profiles')
            .select('id, is_active')
            .eq('id', data.user.id)
            .single()

          if (maricultorProfile && maricultorProfile.is_active === false) {
            setError("Sua conta foi inativada. Entre em contato com o administrador.")
            setLoading(false)
            return
          }

          // 🚀 OTIMIZAÇÃO: Atualizar último acesso em background (só se perfil existir)
          if (maricultorProfile) {
            supabase
              .from('maricultor_profiles')
              .update({ 
                last_sign_in_at: new Date().toISOString(), 
                updated_at: new Date().toISOString() 
              })
              .eq('id', data.user.id)
              .then(({ error }) => {
                if (error) {
                  console.error('⚠️ Erro ao atualizar último acesso (não crítico):', error)
                }
              })
          }

          setUserType("maricultor")
          // 🚀 OTIMIZAÇÃO: Reduzido para 100ms (rápido mas ainda mostra feedback)
          setTimeout(() => {
            router.push('/maricultor/dashboard')
          }, 100)
        }
      }
    } catch (err) {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }, [email, password, router, getSupabaseClient, translateErrorMessage])

  // Memoizar componentes para evitar re-renders desnecessários
  const EmailInput = useMemo(() => (
    <div className="relative">
      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
        placeholder="seu@email.com"
        required
        disabled={loading}
      />
    </div>
  ), [email, loading])

  const PasswordInput = useMemo(() => (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full pl-10 pr-12 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
        placeholder="Digite sua senha"
        required
        disabled={loading}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50 rounded-md flex items-center justify-center transition-colors"
        onClick={() => setShowPassword(!showPassword)}
        disabled={loading}
      >
        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
      </button>
    </div>
  ), [password, showPassword, loading])

  // Memoizar componente de erro para evitar re-renders
  const ErrorMessage = useMemo(() => {
    if (!error) return null
    return (
      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
        {error}
      </div>
    )
  }, [error])

  // Memoizar componente de sucesso para evitar re-renders
  const SuccessMessage = useMemo(() => {
    if (!userType) return null
    return (
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
            ? "Redirecionando para o painel administrativo..." 
            : "Redirecionando para o painel do maricultor..."
          }
        </p>
      </div>
    )
  }, [userType])

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
            <Image 
              src="/amesp_logo.png" 
              alt="AMESP" 
              width={120} 
              height={40} 
              className="h-12 w-auto"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso à Plataforma</h1>
          <p className="text-muted-foreground">Faça login para acessar sua área</p>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Entrar na Plataforma</CardTitle>
                <CardDescription>Acesse sua conta</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {ErrorMessage}

            {SuccessMessage}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">E-mail</label>
                {EmailInput}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Senha</label>
                {PasswordInput}
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
                    <Suspense fallback={<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />}>
                      <LazyFishLoading size="sm" text="" />
                    </Suspense>
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

            {/* NOTA: Link de cadastro escondido temporariamente a pedido do cliente */}
            <div className="hidden text-center pt-4 border-t border-border/50">
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
            Problemas para acessar? Entre em contato:{" "}
            <a href="mailto:amesp@amespmaricultura.org.br" className="text-primary hover:text-primary/80">
              amesp@amespmaricultura.org.br
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

