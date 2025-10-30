import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

async function getGalleryData() {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data: gallery } = await supabase
      .from("gallery")
      .select("*")
      .order("featured", { ascending: false })
      .order("display_order", { ascending: true })

    return gallery || []
  } catch (error) {
    console.error("[galeria] Erro ao buscar galeria:", error)
    return []
  }
}

import GalleryGrid from "@/components/public/GalleryGrid"

export default async function GalleryPage() {
  const gallery = await getGalleryData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12]">
      {/* Header moderno (mesmo estilo das notícias) */}
      <header className="relative overflow-hidden rounded-2xl border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/30" />
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute bottom-0 w-full -translate-y-4 md:-translate-y-5" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="rgb(59 130 246 / 0.12)"/>
          </svg>
        </div>
        <div className="relative px-6 py-10 text-center">
          <div className="flex justify-center mb-4">
            <Image src="/amesp_logo.png" alt="AMESP" width={140} height={40} className="h-10 w-auto" />
          </div>
          <Badge variant="secondary" className="w-fit mx-auto bg-primary/10 text-primary border-primary/20 mb-3">Galeria</Badge>
          <div className="relative z-10 transform -translate-y-1 md:-translate-y-2">
            <h1 className="font-sans font-bold text-3xl lg:text-4xl text-balance">Galeria Completa de Imagens</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">Uma jornada visual completa pela maricultura sustentável no litoral norte de São Paulo.</p>
          </div>
          <div className="mt-4 relative z-10 transform -translate-y-1 md:-translate-y-2">
            <a href="/" className="inline-flex items-center text-sm text-primary hover:underline">← Voltar para a Home</a>
          </div>
          
        </div>
      </header>

      {/* Main Content */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-8"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M598.97 114.72L0 0 0 120 1200 120 1200 0 598.97 114.72z" fill="rgb(248 250 252 / 0.3)"></path>
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">

          {gallery.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma imagem na galeria ainda</p>
              <Button className="mt-4" asChild>
                <Link href="/">Voltar à Home</Link>
              </Button>
            </div>
          ) : (
            <GalleryGrid items={gallery} />
          )}

          <div className="text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à Home
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-primary-foreground/60">
            <p>&copy; 2024 AMESP - Associação dos Maricultores do Estado de São Paulo. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

