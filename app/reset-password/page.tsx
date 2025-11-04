"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, CheckCircle, ArrowLeft, Shield } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const token = searchParams.get('token')
  
  // Verificar o token de recuperação quando a página carregar
  useEffect(() => {
    const verifyRecoveryToken = async () => {
      if (!token || !email) {
        setError("Link de recuperação inválido. Solicite um novo link.")
        setVerifying(false)
        return
      }

      try {
        // Verificar o token usando nossa API
        const response = await fetch(`/api/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`)
        const data = await response.json()
        
        if (!response.ok || !data.success) {
          setError(data.error || "Link de recuperação inválido ou expirado. Solicite um novo link.")
          setVerifying(false)
          return
        }
        
        setVerifying(false)
      } catch (err) {
        setError("Erro ao verificar o link de recuperação.")
        setVerifying(false)
      }
    }
    
    verifyRecoveryToken()
  }, [token, email])
  
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando link de recuperação...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertDescription className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Link Inválido</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => router.push("/auth/forgot-password")} className="w-full">
                Solicitar Novo Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 8
    const hasUpperCase = /[A-Z]/.test(pwd)
    const hasLowerCase = /[a-z]/.test(pwd)
    const hasNumber = /\d/.test(pwd)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
    }
  }

  const passwordValidation = validatePassword(password)
  const passwordsMatch = password === confirmPassword && password.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!passwordValidation.isValid) {
      toast.error("A senha não atende aos critérios de segurança")
      return
    }
    
    if (!passwordsMatch) {
      toast.error("As senhas não coincidem")
      return
    }

    if (!token || !email) {
      toast.error("Link de recuperação inválido")
      return
    }

    setLoading(true)
    
    try {
      // Usar nossa API para redefinir a senha
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          newPassword: password
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        setSuccess(true)
        toast.success("Senha redefinida com sucesso!")
        
        // Redirecionar para o login unificado após 2 segundos
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        toast.error(data.error || "Erro ao redefinir senha. Tente novamente.")
      }
    } catch (error) {
      toast.error("Erro inesperado. Tente novamente.")
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
            <h1 className="text-2xl font-bold text-foreground mb-2">Senha Redefinida!</h1>
            <p className="text-muted-foreground">Sua senha foi alterada com sucesso</p>
          </div>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Sucesso!</h2>
                <p className="text-muted-foreground">Você será redirecionado automaticamente para o sistema.</p>
              </div>
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Redefinir Senha</h1>
          <p className="text-muted-foreground">Crie uma nova senha segura</p>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Nova Senha</CardTitle>
                <CardDescription>{email && `Para: ${email}`}</CardDescription>
              </div>
            </div>
          </CardHeader>
        
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nova Senha */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                    placeholder="Digite sua nova senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {/* Validação da Senha */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.minLength ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      Mínimo 8 caracteres
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasUpperCase ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`text-xs ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                      Uma letra maiúscula
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasLowerCase ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`text-xs ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                      Uma letra minúscula
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                      Um número
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`text-xs ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                      Um caractere especial
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border-0 rounded-xl bg-muted/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                    placeholder="Confirme sua nova senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {confirmPassword.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${passwordsMatch ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordsMatch ? 'Senhas coincidem' : 'Senhas não coincidem'}
                    </span>
                  </div>
                )}
              </div>

              {/* Botão */}
              <Button
                type="submit"
                disabled={!passwordValidation.isValid || !passwordsMatch || loading}
                className="w-full py-3 text-base font-semibold hover:scale-[1.02] transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Redefinindo...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Redefinir Senha</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}