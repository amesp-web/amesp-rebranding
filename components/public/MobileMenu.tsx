"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, LogIn, UserPlus, ChevronDown } from "lucide-react"
import Link from "next/link"
import { ProjectReaderModal } from "@/components/public/ProjectReaderModal"
import { AddToHomeScreenButton } from "@/components/public/AddToHomeScreenButton"

type Project = {
  id: string
  name: string
  slug: string
  submenu_label: string
  content?: any
  published?: boolean
}

type MobileMenuProps = {
  projects: Project[]
}

export function MobileMenu({ projects: initialProjects }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [projectsExpanded, setProjectsExpanded] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [fullProjects, setFullProjects] = useState<Map<string, Project>>(new Map())
  const [projects, setProjects] = useState<Project[]>([])

  // Buscar projetos via fetch (igual ao ProjectsDropdown)
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/public/projects', { cache: 'no-store' })
        
        if (!res.ok) {
          console.error('Erro ao buscar projetos:', res.status)
          setProjects([])
          return
        }
        
        const data = await res.json()
        
        // Garantir que data é um array válido
        if (!data || !Array.isArray(data)) {
          console.error('Resposta da API não é um array:', data)
          setProjects([])
          return
        }
        
        setProjects(data)
        
        // Pré-carregar conteúdo completo
        if (data.length > 0) {
          const projectsMap = new Map<string, Project>()
          await Promise.all(
            data.map(async (proj: Project) => {
              try {
                const fullRes = await fetch(`/api/admin/projects/${proj.id}`)
                if (fullRes.ok) {
                  const fullData = await fullRes.json()
                  projectsMap.set(proj.id, fullData)
                }
              } catch (err) {
                console.error(`Erro ao carregar projeto ${proj.id}:`, err)
              }
            })
          )
          setFullProjects(projectsMap)
        }
      } catch (error) {
        console.error('Erro ao carregar projetos:', error)
        setProjects([])
      }
    }
    
    loadProjects()
  }, [])

  const closeMenu = () => {
    setIsOpen(false)
    setProjectsExpanded(false)
  }

  const openProject = (projectId: string) => {
    setSelectedProjectId(projectId)
    closeMenu()
  }

  return (
    <>
      {/* Botão Hamburguer */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="xl:hidden p-2 hover:bg-primary/5 rounded-lg transition-colors"
        aria-label="Menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-muted-foreground" />
        ) : (
          <Menu className="h-6 w-6 text-muted-foreground" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Menu Mobile */}
      <div
        className={`
          fixed top-0 right-0 h-screen w-80 bg-white shadow-2xl z-50 
          transform transition-transform duration-300 ease-in-out
          xl:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-screen overflow-hidden">
          {/* Header do Menu */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-bold text-lg">Menu</h2>
            <button
              onClick={closeMenu}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Links de Navegação */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <a
              href="#sobre"
              onClick={closeMenu}
              className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              Sobre Nós
            </a>
            <a
              href="#noticias"
              onClick={closeMenu}
              className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              Notícias
            </a>
            <a
              href="#galeria"
              onClick={closeMenu}
              className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              Galeria
            </a>
            <a
              href="#produtores"
              onClick={closeMenu}
              className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              Produtores
            </a>
            <a
              href="#maricultura"
              onClick={closeMenu}
              className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              Maricultura
            </a>
            <a
              href="#turismo"
              onClick={closeMenu}
              className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              Turismo
            </a>

            {/* Projetos Socioambientais (Expandível) */}
            <div>
              <button
                onClick={() => setProjectsExpanded(!projectsExpanded)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
              >
                <span>Projetos Socioambientais</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${projectsExpanded ? 'rotate-180' : ''}`} />
              </button>
              <div 
                className={`ml-4 mt-1 space-y-1 bg-slate-50/50 rounded-lg overflow-hidden transition-all duration-200 ${projectsExpanded ? 'max-h-96 p-2 opacity-100' : 'max-h-0 p-0 opacity-0'}`}
              >
                {projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => openProject(project.id)}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:text-primary hover:bg-white rounded-lg transition-all"
                    >
                      {project.submenu_label || project.name}
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-2 text-xs text-muted-foreground">Nenhum projeto publicado</p>
                )}
              </div>
            </div>

            <a
              href="/downloads"
              onClick={closeMenu}
              className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              Downloads
            </a>
            <a
              href="#eventos"
              onClick={closeMenu}
              className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              Eventos
            </a>
            <a
              href="#contato"
              onClick={closeMenu}
              className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              Contato
            </a>
          </div>

          {/* Botões de Ação no Footer */}
          <div className="p-4 border-t space-y-3">
            <AddToHomeScreenButton variant="button" onAfterClick={closeMenu} />
            <Button
              asChild
              className="w-full bg-gradient-to-r from-[#023299] to-cyan-500 hover:from-[#023299]/90 hover:to-cyan-500/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <a href="/login" onClick={closeMenu} className="flex items-center justify-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span>Entrar</span>
              </a>
            </Button>
            {/* NOTA: Botão escondido temporariamente a pedido do cliente (ainda não sabem se irão utilizar) */}
            <Button
              asChild
              className="hidden w-full bg-gradient-to-r from-[#023299] to-cyan-500 hover:from-[#023299]/90 hover:to-cyan-500/90 shadow-md"
            >
              <a href="/maricultor/cadastro" onClick={closeMenu} className="flex items-center justify-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Cadastrar-se</span>
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Leitura de Projeto */}
      {selectedProjectId && fullProjects.has(selectedProjectId) && (
        <ProjectReaderModal
          isOpen={!!selectedProjectId}
          onClose={() => setSelectedProjectId(null)}
          project={fullProjects.get(selectedProjectId)!}
        />
      )}
    </>
  )
}

