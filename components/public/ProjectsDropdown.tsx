"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { ProjectReaderModal } from "@/components/public/ProjectReaderModal"

interface Project {
  id: string
  name: string
  slug: string
  submenu_label: string
  display_order: number
}

interface FullProject {
  id: string
  name: string
  slug: string
  content: any
  published: boolean
}

// Cache global de projetos carregados
const projectsCache = new Map<string, FullProject>()

export function ProjectsDropdown() {
  const [projects, setProjects] = useState<Project[]>([])
  const [fullProjects, setFullProjects] = useState<Map<string, FullProject>>(new Map())
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<FullProject | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchProjects() {
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
        
        // Pré-carregar todos os projetos em background
        if (data.length > 0) {
          const loadPromises = data.map(async (project: Project) => {
            try {
              const fullRes = await fetch(`/api/admin/projects/${project.id}`, { cache: 'force-cache' })
              const fullProject = await fullRes.json()
              return { id: project.id, project: fullProject }
            } catch (e) {
              console.error('Erro ao pré-carregar projeto:', project.name)
              return null
            }
          })
          
          Promise.all(loadPromises).then((results) => {
            const newMap = new Map<string, FullProject>()
            results.forEach((result) => {
              if (result) {
                newMap.set(result.id, result.project)
                projectsCache.set(result.id, result.project)
              }
            })
            setFullProjects(newMap)
          })
        }
      } catch (error) {
        console.error('Erro ao buscar projetos:', error)
        setProjects([])
      }
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 flex items-center gap-1"
      >
        Projetos Socioambientais
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-[9999]">
          {projects.length === 0 ? (
            <div className="px-4 py-2.5 text-sm text-slate-500 italic">
              Nenhum projeto publicado
            </div>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onClick={() => {
                  const fullProject = fullProjects.get(project.id) || projectsCache.get(project.id)
                  if (fullProject) {
                    setSelectedProject(fullProject)
                  }
                  setIsOpen(false)
                }}
              >
                {project.submenu_label || project.name}
              </button>
            ))
          )}
        </div>
      )}

      <ProjectReaderModal 
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  )
}

