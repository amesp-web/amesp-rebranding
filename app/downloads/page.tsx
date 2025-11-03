import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download as DownloadIcon, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

async function getDownloads() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    const res = await fetch(`${baseUrl}/api/admin/downloads`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!res.ok) {
      console.error('Erro ao buscar downloads:', await res.text())
      return []
    }

    return await res.json()
  } catch (error) {
    console.error('Erro ao buscar downloads:', error)
    return []
  }
}

export default async function DownloadsPublicPage() {
  const downloads = await getDownloads()

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    if (mb < 1) {
      const kb = bytes / 1024
      return `${kb.toFixed(2)} KB`
    }
    return `${mb.toFixed(2)} MB`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12]">
      {/* Header moderno similar ao de galeria e notícias */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-400">
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
              Downloads
            </span>
          </div>

          {/* Título e Subtítulo */}
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-3">
            Materiais para Download
          </h1>
          <p className="text-white/90 text-center text-lg max-w-2xl mx-auto mb-6">
            Acesse manuais, guias e documentos técnicos da AMESP
          </p>

          {/* Voltar para Home */}
          <div className="flex justify-center mt-8">
            <Link href="/">
              <Button variant="secondary" className="bg-white/90 hover:bg-white text-indigo-600 shadow-lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para a Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-12">
        {downloads.length === 0 ? (
          <Card className="max-w-md mx-auto border-0 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Nenhum manual disponível</h3>
              <p className="text-sm text-muted-foreground text-center">
                No momento não há materiais para download
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {downloads.map((download: any) => (
              <Card key={download.id} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <CardContent className="p-6 relative z-10">
                  {/* Ícone */}
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-8 w-8 text-indigo-600" />
                  </div>

                  {/* Título */}
                  <h3 className="font-semibold text-lg text-slate-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {download.title}
                  </h3>

                  {/* Descrição */}
                  {download.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 min-h-[4rem]">
                      {download.description}
                    </p>
                  )}

                  {/* Meta informações */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {download.file_name.split('.').pop()?.toUpperCase()}
                    </span>
                    <span>{formatFileSize(download.file_size)}</span>
                  </div>

                  {/* Botão de Download */}
                  <a
                    href={download.file_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg group-hover:shadow-xl transition-all">
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Baixar Manual
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

