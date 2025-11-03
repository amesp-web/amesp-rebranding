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
      {/* Header moderno oceânico */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400">
        {/* SVG Waves */}
        <div className="absolute inset-0">
          <svg className="absolute bottom-0 w-full h-32" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="white" fillOpacity="0.3" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <path fill="white" fillOpacity="0.2" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,165.3C960,149,1056,171,1152,186.7C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 md:py-20">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Image src="/amesp_logo.png" alt="AMESP" width={180} height={60} className="h-16 w-auto" />
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
              Galeria
            </span>
          </div>

          {/* Título e Subtítulo */}
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-3">
            Galeria Completa de Imagens
          </h1>
          <p className="text-white/90 text-center text-lg max-w-2xl mx-auto mb-6">
            Uma jornada visual completa pela maricultura sustentável no litoral norte de São Paulo
          </p>

          {/* Voltar para Home */}
          <div className="flex justify-center mt-8">
            <Link href="/">
              <Button variant="secondary" className="bg-white/90 hover:bg-white text-blue-600 shadow-lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para a Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-12">
        {gallery.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma imagem na galeria ainda</p>
          </div>
        ) : (
          <GalleryGrid items={gallery} />
        )}
      </div>

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

