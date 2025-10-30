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
      .order("display_order", { ascending: true })

    return gallery || []
  } catch (error) {
    console.error("[galeria] Erro ao buscar galeria:", error)
    return []
  }
}

export default async function GalleryPage() {
  const gallery = await getGalleryData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/amesp_logo.png"
                alt="AMESP - Associação dos Maricultores do Estado de São Paulo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
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
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="w-fit mx-auto">
              Galeria Visual
            </Badge>
            <h1 className="font-sans font-bold text-3xl lg:text-4xl text-balance">
              Galeria Completa de Imagens
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Uma jornada visual completa pela maricultura sustentável no litoral norte de São Paulo.
            </p>
          </div>

          {gallery.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma imagem na galeria ainda</p>
              <Button className="mt-4" asChild>
                <Link href="/">Voltar à Home</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {gallery.map((item: any, index: number) => {
                const isFeatured = item.featured || index === 0

                return (
                  <div
                    key={item.id}
                    className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 rounded-xl shadow-lg relative ${
                      isFeatured && index === 0
                        ? "md:col-span-2 md:row-span-2 aspect-[2/1] md:aspect-auto"
                        : "aspect-square"
                    }`}
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                    <div
                      className={`absolute text-white transition-all duration-300 opacity-100 ${
                        isFeatured && index === 0
                          ? "bottom-6 left-6 right-6"
                          : "bottom-4 left-4 right-4"
                      }`}
                    >
                      {isFeatured && (
                        <Badge className="mb-2 bg-primary/90 text-primary-foreground">
                          Destaque
                        </Badge>
                      )}
                      <h3
                        className={`font-semibold mb-1 drop-shadow-lg ${
                          isFeatured && index === 0 ? "text-2xl" : "text-lg"
                        }`}
                      >
                        {item.title}
                      </h3>
                      {item.description && (
                        <p
                          className={`text-white/95 drop-shadow-md ${
                            isFeatured && index === 0 ? "text-base" : "text-sm"
                          }`}
                        >
                          {item.description}
                        </p>
                      )}
                      {item.category && (
                        <p className="text-white/80 text-xs mt-2">{item.category}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
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

