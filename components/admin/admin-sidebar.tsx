"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Newspaper, Users, Camera, MapPin, Settings, LogOut, ChevronLeft, ChevronRight, Info, Leaf, Download, Calendar, Monitor, Mail, Fish, DollarSign } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useSidebar } from "@/contexts/sidebar-context"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Notícias", href: "/admin/news", icon: Newspaper },
  { name: "Eventos", href: "/admin/events", icon: Calendar },
  { name: "Maricultores", href: "/admin/producers", icon: MapPin },
  { name: "Mensalidades", href: "/admin/payments", icon: DollarSign },
  { name: "Galeria", href: "/admin/gallery", icon: Camera },
  { name: "Usuários", href: "/admin/users", icon: Users },
  { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { name: "Infos da Home", href: "/admin/home-info", icon: Monitor },
  { name: "Quem Somos", href: "/admin/about", icon: Info },
  { name: "Maricultura", href: "/admin/maricultura", icon: Fish },
  { name: "Turismo", href: "/admin/turismo", icon: MapPin },
  { name: "Projetos Socioambientais", href: "/admin/projects", icon: Leaf },
  { name: "Gerenciar Download", href: "/admin/downloads", icon: Download },
  { name: "Configurações", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isCollapsed, toggleSidebar } = useSidebar()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <>
      {/* Sidebar */}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 shadow-sm">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center px-4 border-b border-gray-200">
            <div className="flex items-center flex-1">
              <div className="flex-shrink-0">
                <Image
                  src="/amesp_logo.png"
                  alt="AMESP Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <h1 className="text-lg font-semibold text-gray-900">AMESP</h1>
                  <p className="text-xs text-gray-500">Administração</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-3">
            <ul role="list" className="flex flex-1 flex-col gap-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                        isCollapsed ? "justify-center" : "",
                        isActive
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                        )}
                        aria-hidden="true"
                      />
                      {!isCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
            
            {/* Logout */}
            <div className="mt-auto py-3">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50",
                  isCollapsed ? "justify-center" : ""
                )}
                onClick={handleSignOut}
                title={isCollapsed ? "Sair" : undefined}
              >
                <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Sair</span>}
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* Toggle Button - Fixed Position */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "hidden lg:fixed lg:z-50 lg:flex lg:items-center lg:justify-center",
          "h-8 w-8 rounded-full bg-white border border-gray-300 shadow-lg",
          "hover:shadow-xl transition-all duration-200 hover:scale-105",
          "top-4 transition-all duration-300 ease-in-out",
          isCollapsed ? "left-12" : "left-60"
        )}
        title={isCollapsed ? "Expandir sidebar" : "Minimizar sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>
    </>
  )
}
