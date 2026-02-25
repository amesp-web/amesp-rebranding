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
    <div className="min-h-screen bg-[#ECEEEE]">
      {/* Hero com banner da Galeria ocupando toda a largura */}
      <div className="bg-[#ECEEEE] pt-6 md:pt-8">
        <div className="relative w-full">
          <div className="overflow-hidden shadow-2xl border-y border-white/40 bg-white">
            <Image
              src="/galeria-hero.png"
              alt="Galeria - confira nossas imagens"
              width={1920}
              height={400}
              priority
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Voltar para Home */}
        <div className="container mx-auto px-4 mt-4 mb-4 flex justify-center">
          <Link href="/">
            <Button variant="secondary" className="bg-white/90 hover:bg-white text-blue-600 shadow-lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a Home
            </Button>
          </Link>
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

