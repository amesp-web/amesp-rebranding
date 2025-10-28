import type React from "react"
import Link from "next/link"
import { ArrowLeft, Fish } from "lucide-react"

export default function TestMaricultorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12]">
      {/* Header simples para desenvolvimento */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/login/dev"
              className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao login</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Fish className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-sans font-bold text-xl text-primary">AMESP Maricultor</span>
          </div>
          <div className="text-sm text-muted-foreground">
            🔧 Modo Desenvolvimento
          </div>
        </div>
      </header>
      
      <main>{children}</main>
    </div>
  )
}

