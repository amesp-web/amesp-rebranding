import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProjectsListDnD } from "@/components/admin/ProjectsListDnD"
import { FolderTree } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminProjectsList() {
  let projects: any[] | null = null
  
  try {
    // 🔧 Buscar direto do banco (sem fetch interno)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
    
    if (!error) {
      projects = data
    }
  } catch (err) {
    console.error('Error fetching projects:', err)
  }

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

