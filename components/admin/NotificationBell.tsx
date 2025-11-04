"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Mail, UserPlus, Newspaper, Check, CheckCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  link: string | null
  icon: string
  is_read: boolean
  priority: string
  metadata: any
  created_at: string
  read_at: string | null
}

const iconMap: { [key: string]: any } = {
  Mail,
  UserPlus,
  Newspaper,
  Bell
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
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

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications')
      const result = await response.json()

      if (result.success) {
        setNotifications(result.data || [])
        setUnreadCount(result.unread || 0)
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_read: true })
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })

      if (response.ok) {
        toast.success('Todas as notificações marcadas como lidas')
        fetchNotifications()
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
      toast.error('Erro ao atualizar notificações')
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diffInSeconds < 60) return 'agora mesmo'
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} h`
    if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)} dias`
    return past.toLocaleDateString('pt-BR')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-300 text-red-700'
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-700'
      case 'normal': return 'bg-blue-100 border-blue-300 text-blue-700'
      case 'low': return 'bg-gray-100 border-gray-300 text-gray-700'
      default: return 'bg-blue-100 border-blue-300 text-blue-700'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-primary/5"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-[9999]">
          {/* Header do Dropdown */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-slate-800">Notificações</h3>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-7 px-2 hover:bg-blue-50"
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Marcar todas
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Lista de Notificações */}
          <ScrollArea className="max-h-[500px]">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Carregando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => {
                  const IconComponent = iconMap[notification.icon] || Bell
                  
                  return (
                    <div
                      key={notification.id}
                      className={`group p-4 hover:bg-blue-50/50 transition-colors cursor-pointer ${
                        !notification.is_read ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                          notification.priority === 'urgent' ? 'bg-red-100' :
                          notification.priority === 'high' ? 'bg-orange-100' :
                          'bg-blue-100'
                        }`}>
                          <IconComponent className={`h-5 w-5 ${
                            notification.priority === 'urgent' ? 'text-red-600' :
                            notification.priority === 'high' ? 'text-orange-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <p className={`text-sm font-semibold ${
                              !notification.is_read ? 'text-slate-900' : 'text-slate-600'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 ml-2 mt-1" />
                            )}
                          </div>
                          {notification.message && (
                            <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                              {notification.message}
                            </p>
                          )}
                          <span className="text-xs text-slate-400">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 bg-slate-50/50">
              <p className="text-xs text-center text-muted-foreground">
                Mostrando últimas {notifications.length} notificações
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

