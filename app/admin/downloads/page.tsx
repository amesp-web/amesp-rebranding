import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Plus, FileText } from "lucide-react"
import Link from "next/link"
import { DownloadsListDnD } from "@/components/admin/downloads-list-dnd"

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

export default async function DownloadsPage() {
  const downloads = await getDownloads()

  return (
    <div className="space-y-8">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 border-0 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Download className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Gerenciar Downloads</h1>
                <p className="text-white/90">Manuais e arquivos para download</p>
              </div>
            </div>
          </div>
          <Link href="/admin/downloads/new">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl">
              <Plus className="h-5 w-5 mr-2" />
              Novo Manual
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Manuais</CardTitle>
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{downloads.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-pink-50/50 to-rose-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tamanho Total</CardTitle>
              <Download className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {((downloads.reduce((acc: number, d: any) => acc + (d.file_size || 0), 0)) / (1024 * 1024)).toFixed(1)} MB
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 via-rose-50/50 to-red-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Último Upload</CardTitle>
              <FileText className="h-5 w-5 text-pink-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-pink-600">
              {downloads.length > 0
                ? new Date(downloads[0].created_at).toLocaleDateString('pt-BR')
                : 'Nenhum'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de downloads */}
      {downloads.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Download className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Nenhum manual cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-6">Comece adicionando seu primeiro manual</p>
            <Link href="/admin/downloads/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Manual
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <DownloadsListDnD initialDownloads={downloads} />
      )}
    </div>
  )
}

