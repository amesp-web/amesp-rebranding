'use client'

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download as DownloadIcon, FileText, ArrowLeft, Search, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function DownloadsPublicPage() {
  const [downloads, setDownloads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Carregar downloads ao montar o componente
  useEffect(() => {
    async function loadDownloads() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
        const res = await fetch(`${baseUrl}/api/admin/downloads`, {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' }
        })

        if (res.ok) {
          const data = await res.json()
          setDownloads(data)
        }
      } catch (error) {
        console.error('Erro ao buscar downloads:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDownloads()
  }, [])

  // Filtrar downloads baseado no termo de busca
  const filteredDownloads = downloads.filter((download) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    const title = download.title.toLowerCase()
    const description = (download.description || '').toLowerCase()
    const fileName = download.file_name.toLowerCase()
    return title.includes(search) || description.includes(search) || fileName.includes(search)
  })

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
        {/* Campo de Busca */}
        {!loading && downloads.length > 0 && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar manuais por título, descrição ou nome do arquivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-12 h-14 text-lg border-2 border-slate-200 focus:border-blue-400 rounded-2xl shadow-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-3 text-center">
                {filteredDownloads.length === 0 
                  ? 'Nenhum manual encontrado' 
                  : `${filteredDownloads.length} ${filteredDownloads.length === 1 ? 'manual encontrado' : 'manuais encontrados'}`
                }
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredDownloads.length === 0 && !searchTerm ? (
          <Card className="max-w-md mx-auto border-0 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Nenhum manual disponível</h3>
              <p className="text-sm text-muted-foreground text-center">
                No momento não há materiais para download
              </p>
            </CardContent>
          </Card>
        ) : filteredDownloads.length === 0 && searchTerm ? (
          <Card className="max-w-md mx-auto border-0 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Nenhum manual encontrado</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Não encontramos resultados para "{searchTerm}"
              </p>
              <Button onClick={() => setSearchTerm('')} variant="outline">
                Limpar busca
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredDownloads.map((download: any, index: number) => {
              // Detectar tipo de manual baseado em palavras-chave no título/descrição
              const titleLower = download.title.toLowerCase()
              const descLower = (download.description || '').toLowerCase()
              const fullText = `${titleLower} ${descLower}`
              
              // Definir temas específicos por categoria
              const themes = {
                algas: { 
                  gradient: 'from-emerald-50 via-teal-50/30 to-white',
                  iconBg: 'from-emerald-100 to-teal-100',
                  iconColor: 'text-emerald-600',
                  hoverGradient: 'from-emerald-500/5',
                  buttonGradient: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                },
                mexilhao: { 
                  gradient: 'from-blue-50 via-cyan-50/30 to-white',
                  iconBg: 'from-blue-100 to-cyan-100',
                  iconColor: 'text-blue-600',
                  hoverGradient: 'from-blue-500/5',
                  buttonGradient: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                },
                ostra: { 
                  gradient: 'from-purple-50 via-pink-50/30 to-white',
                  iconBg: 'from-purple-100 to-pink-100',
                  iconColor: 'text-purple-600',
                  hoverGradient: 'from-purple-500/5',
                  buttonGradient: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                },
                default: { 
                  gradient: 'from-orange-50 via-amber-50/30 to-white',
                  iconBg: 'from-orange-100 to-amber-100',
                  iconColor: 'text-orange-600',
                  hoverGradient: 'from-orange-500/5',
                  buttonGradient: 'from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700'
                },
              }
              
              // Detectar categoria por palavras-chave
              let theme = themes.default
              if (fullText.includes('alga') || fullText.includes('kappaphycus') || fullText.includes('alvarezii')) {
                theme = themes.algas
              } else if (fullText.includes('mexilh') || fullText.includes('mytilus') || fullText.includes('perna')) {
                theme = themes.mexilhao
              } else if (fullText.includes('ostra') || fullText.includes('crassostrea') || fullText.includes('gigas')) {
                theme = themes.ostra
              }
              
              return (
                <Card key={download.id} className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${theme.gradient}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.hoverGradient} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
                  
                  <CardContent className="p-6 relative z-10">
                    {/* Preview do PDF (mostra primeira página automaticamente) ou Ícone */}
                    {download.file_name.toLowerCase().endsWith('.pdf') ? (
                      <div className="mb-4 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 bg-white relative" style={{ height: '320px' }}>
                        <iframe
                          src={`${download.file_url}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH&zoom=105`}
                          className="w-full border-0 absolute"
                          title={download.title}
                          style={{ 
                            pointerEvents: 'none',
                            height: '400px',
                            top: '-20px',
                            left: '0'
                          }}
                        />
                      </div>
                    ) : (
                      <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${theme.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <FileText className={`h-10 w-10 ${theme.iconColor}`} />
                      </div>
                    )}

                    {/* Título */}
                    <h3 className="font-bold text-xl text-slate-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                      {download.title}
                    </h3>

                    {/* Descrição */}
                    {download.description && (
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4 min-h-[4rem]">
                        {download.description}
                      </p>
                    )}

                    {/* Meta informações com estilo melhorado */}
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-5 pb-4 border-b border-slate-200">
                      <span className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg">
                        <FileText className="h-3.5 w-3.5" />
                        {download.file_name.split('.').pop()?.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg">
                        <DownloadIcon className="h-3.5 w-3.5" />
                        {formatFileSize(download.file_size)}
                      </span>
                    </div>

                    {/* Botão de Download com gradiente temático */}
                    <a
                      href={download.file_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className={`w-full bg-gradient-to-r ${theme.buttonGradient} shadow-lg group-hover:shadow-xl transition-all font-semibold`}>
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Baixar Manual
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

