import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProjectsListDnD } from "@/components/admin/ProjectsListDnD"
import { FolderTree } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminProjectsList() {
  let projects: any[] | null = null
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    const res = await fetch(`${base}/api/admin/projects`, { cache: 'no-store' })
    projects = await res.json()
  } catch {}

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 shadow-xl">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <FolderTree className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Projetos Socioambientais</h1>
              <p className="text-white/90">Gerencie os projetos do site</p>
            </div>
          </div>
          <Button asChild className="rounded-2xl px-5 bg-white text-blue-700 hover:bg-white/90 shadow-lg">
            <Link href="/admin/projects/new">Novo Projeto</Link>
          </Button>
        </div>
      </div>

      {projects && projects.length > 0 ? (
        <ProjectsListDnD items={(projects || []).map((p: any) => ({ ...p, id: String(p.id) }))} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum projeto cadastrado</CardTitle>
            <CardDescription>Crie seu primeiro projeto socioambiental</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/projects/new">Novo Projeto</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

