"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { FishTableLoading, FishLoading } from "@/components/ui/fish-loading"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Mail, Phone, Users, Shield, Fish, CheckCircle, Clock, UserPlus, UserX, RefreshCw } from "lucide-react"
import InputMask from "react-input-mask"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { toast } from "sonner"
import { EmailService } from "@/lib/email-service"
import { cn } from "@/lib/utils"

interface User {
  id: string
  email: string
  full_name: string
  phone: string
  role: 'admin'
  created_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
  is_active?: boolean
  has_logged_in?: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [buttonClicked, setButtonClicked] = useState(false)
  
  // Estados para modais de confirmação
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, user: User | null}>({isOpen: false, user: null})
  const [statusConfirm, setStatusConfirm] = useState<{isOpen: boolean, user: User | null}>({isOpen: false, user: null})
  const [emailConfirm, setEmailConfirm] = useState<{isOpen: boolean, user: User | null}>({isOpen: false, user: null})
  
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "admin" as "admin"
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('🔄 Buscando usuários...')
      
      // Cache-busting ULTRA agressivo
      const timestamp = Date.now()
      const random1 = Math.random()
      const random2 = Math.random()
      const random3 = Math.random()
      const version = Math.floor(Math.random() * 10000)
      const bust = Math.random().toString(36).substring(7)
      const url = `/api/admin/users?t=${timestamp}&r1=${random1}&r2=${random2}&r3=${random3}&v=${version}&bust=${bust}&force=${Date.now()}&nocache=${Math.random()}`
      
      console.log('🌐 URL da requisição:', url)
      
      const response = await fetch(url, {
        cache: 'no-store',
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'If-None-Match': '*',
          'If-Modified-Since': '0',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar usuários')
      }

      console.log('📊 Usuários recebidos da API:', result.users?.length || 0)
      console.log('📋 Dados detalhados:', result.users)
      
      // Log específico para Grah Duetes
      const grahUser = result.users?.find((u: User) => u.email === 'graziely@gobi.consulting')
      if (grahUser) {
        console.log('🔍 GRAH DUETES NO FRONTEND:')
        console.log('  - last_sign_in_at:', grahUser.last_sign_in_at)
        console.log('  - has_logged_in:', grahUser.has_logged_in)
        console.log('  - is_active:', grahUser.is_active)
        console.log('  - Tipo de last_sign_in_at:', typeof grahUser.last_sign_in_at)
        console.log('  - É null?', grahUser.last_sign_in_at === null)
        console.log('  - É undefined?', grahUser.last_sign_in_at === undefined)
        console.log('  - Usuário completo:', grahUser)
      } else {
        console.warn('⚠️ GRAH DUETES NÃO ENCONTRADO NA RESPOSTA DA API!')
        console.log('📋 Todos os emails na resposta:', result.users?.map((u: User) => u.email))
      }
      
      // ATUALIZAR ESTADO DIRETAMENTE
      setUsers(result.users || [])
      
      console.log('✅ Estado atualizado com', result.users?.length || 0, 'usuários')
      
    } catch (error: any) {
      console.error('❌ Erro:', error)
      toast.error("Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 Iniciando criação de usuário...', formData)
    
    try {
      if (editingUser) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from('admin_profiles')
          .update({
            full_name: formData.full_name,
            role: formData.role
          })
          .eq('id', editingUser.id)

        if (error) throw error

        toast.success("Usuário atualizado com sucesso!")
      } else {
        // Criar novo usuário via API
        console.log('📤 Enviando dados para API:', {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role
        })
        
        const response = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role
          })
        })

        console.log('📥 Resposta da API:', response.status, response.statusText)
        const result = await response.json()
        console.log('📋 Resultado:', result)

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao criar usuário')
        }

        // Enviar email com senha temporária
        await sendWelcomeEmail(formData.email, result.tempPassword, formData.full_name)

        toast.success("Usuário criado com sucesso! E-mail de boas-vindas enviado.")
      }

      setIsDialogOpen(false)
      setEditingUser(null)
      resetForm()
      
      // ATUALIZAR LISTAGEM IMEDIATAMENTE
      await fetchUsers()
      console.log('✅ Usuários atualizados após criação')
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error)
      toast.error(error.message || "Erro ao salvar usuário")
    } finally {
      setLoading(false)
    }
  }

  const generateTemporaryPassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const hasUserLoggedIn = (user: User) => {
    // Preferir flag do backend; fallback para checar string
    const hasLoggedIn = Boolean(user.has_logged_in) || (user.last_sign_in_at !== null && user.last_sign_in_at !== undefined)
    console.log(`🔍 Verificando se ${user.full_name} já fez login:`, {
      last_sign_in_at: user.last_sign_in_at,
      has_logged_in: user.has_logged_in,
      hasLoggedIn
    })
    return hasLoggedIn
  }

  const sendWelcomeEmail = async (email: string, password: string, userName: string) => {
    const emailService = EmailService.getInstance()
    const success = await emailService.sendWelcomeEmail(email, password, userName)
    
    if (!success) {
      throw new Error("Falha ao enviar e-mail de boas-vindas")
    }
  }

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      role: "admin"
    })
  }

  const handleEdit = (user: User) => {
    console.log('✏️ Editando usuário:', user.email)
    setEditingUser(user)
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role
    })
    setIsDialogOpen(true)
  }

  const handleToggleStatus = (user: User) => {
    console.log('🔄 Solicitando alteração de status:', user.email)
    setStatusConfirm({isOpen: true, user})
  }

  const confirmToggleStatus = async () => {
    if (!statusConfirm.user) return
    
    try {
      console.log('🔄 Alterando status do usuário:', statusConfirm.user.email)
      
      // Usar API para alterar status do usuário
      const response = await fetch('/api/admin/toggle-user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: statusConfirm.user.id,
          currentStatus: statusConfirm.user.is_active ? 'active' : 'inactive'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao alterar status')
      }

      const result = await response.json()
      console.log('✅ Status alterado:', result)
      
      toast.success(`Usuário ${statusConfirm.user.is_active ? 'inativado' : 'ativado'} com sucesso!`)
      await fetchUsers() // Recarregar lista
    } catch (error: any) {
      console.error('❌ Erro ao alterar status:', error)
      toast.error(error.message || "Erro ao alterar status do usuário")
    }
  }

  const handleResendEmail = (user: User) => {
    if (hasUserLoggedIn(user)) {
      toast.warning("Este usuário já fez login e definiu uma senha permanente. Não é possível reenviar e-mail de boas-vindas.")
      return
    }
    
    console.log('📧 Solicitando reenvio de e-mail:', user.email)
    setEmailConfirm({isOpen: true, user})
  }

  const confirmResendEmail = async () => {
    if (!emailConfirm.user) return
    
    try {
      console.log('📧 Reenviando e-mail para:', emailConfirm.user.email)
      
      // Gerar nova senha temporária
      const tempPassword = generateTemporaryPassword()
      
      // Primeiro, atualizar a senha do usuário no banco
      console.log('🔑 Atualizando senha do usuário...')
      const passwordResponse = await fetch('/api/admin/reset-user-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: emailConfirm.user.id,
          tempPassword: tempPassword
        })
      })

      if (!passwordResponse.ok) {
        const error = await passwordResponse.json()
        throw new Error(error.error || 'Erro ao atualizar senha')
      }

      // Depois, enviar e-mail via API
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailConfirm.user.email,
          tempPassword: tempPassword,
          userName: emailConfirm.user.full_name
        })
      })

      if (!emailResponse.ok) {
        const error = await emailResponse.json()
        throw new Error(error.error || 'Erro ao enviar e-mail')
      }

      console.log('✅ E-mail reenviado com sucesso!')
      toast.success("E-mail de boas-vindas reenviado!")
    } catch (error: any) {
      console.error('❌ Erro ao reenviar e-mail:', error)
      toast.error(error.message || "Erro ao reenviar e-mail")
    } finally {
      setEmailConfirm({isOpen: false, user: null})
    }
  }

  const handleDelete = (user: User) => {
    console.log('🗑️ Solicitando exclusão:', user.email)
    setDeleteConfirm({isOpen: true, user})
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.user) return
    
    try {
      console.log('🗑️ Excluindo usuário:', deleteConfirm.user.id)
      
      // Usar API para excluir usuário
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: deleteConfirm.user.id })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir usuário')
      }

      const result = await response.json()
      console.log('✅ Usuário excluído:', result)
      
      // Fechar modal primeiro
      setDeleteConfirm({isOpen: false, user: null})
      
      // Mostrar toast
      toast.success("Usuário excluído com sucesso!")
      
      // ATUALIZAR LISTAGEM IMEDIATAMENTE
      await fetchUsers()
      
    } catch (error: any) {
      console.error('❌ Erro ao excluir usuário:', error)
      toast.error(error.message || "Erro ao excluir usuário")
      // Fechar modal mesmo em caso de erro
      setDeleteConfirm({isOpen: false, user: null})
    }
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-8">
      {/* Header com gradiente oceânico */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-8 shadow-xl">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
        </div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Users className="h-8 w-8 mr-3" />
                Usuários
              </h1>
              <p className="text-blue-100 text-lg">Gerencie usuários e permissões do sistema</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-white">
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-blue-100 text-sm">Total de usuários</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ações e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => { setEditingUser(null); resetForm(); }}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20">
            <DialogHeader className="bg-gradient-to-r from-blue-50 via-cyan-50/50 to-teal-50/30 -m-6 mb-6 p-6 rounded-t-lg border-b border-blue-200/50">
              <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                <Users className="h-6 w-6 mr-3 text-blue-600" />
                {editingUser ? (
                  <>
                    <Edit className="h-5 w-5 mr-2" />
                    Editar Usuário
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Novo Usuário
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-2">
                {editingUser 
                  ? "Atualize as informações do usuário" 
                  : "Crie um novo usuário no sistema"
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="full_name" className="text-sm font-semibold text-slate-700">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  required
                  className="border-2 border-blue-200/50 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                  placeholder="Digite o nome completo"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={!!editingUser}
                  className="border-2 border-blue-200/50 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 disabled:bg-gray-100"
                  placeholder="usuario@exemplo.com"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Telefone</Label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  maskChar=""
                >
                  {(inputProps) => (
                    <Input
                      {...inputProps}
                      id="phone"
                      className="border-2 border-blue-200/50 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                      placeholder="(11) 99999-9999"
                    />
                  )}
                </InputMask>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="role" className="text-sm font-semibold text-slate-700">Tipo de Acesso</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: "admin") => setFormData({...formData, role: value})}
                >
                  <SelectTrigger className="w-full border-2 border-blue-200/50 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Administrador
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-blue-200/50">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-2 border-gray-300 hover:border-gray-400 rounded-xl px-6 py-2 transition-all duration-300"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                  onClick={() => {
                    console.log('🔘 Botão clicado!')
                    setButtonClicked(true)
                    setTimeout(() => setButtonClicked(false), 200)
                  }}
                  className={`bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-150 rounded-xl px-6 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                    buttonClicked 
                      ? 'scale-[0.95] brightness-110 shadow-sm' 
                      : 'hover:scale-[1.02] active:scale-[0.98] active:brightness-110 active:shadow-sm'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <FishLoading size="sm" text="" />
                      <span>{editingUser ? 'Atualizando...' : 'Criando...'}</span>
                    </div>
                  ) : editingUser ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Atualizar
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Criar Usuário
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Busca moderna */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-3 border-2 border-blue-200/50 rounded-xl bg-white/80 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 w-full sm:w-80"
          />
        </div>
      </div>

        {/* Users Table */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-cyan-50/50 to-teal-50/30 border-b border-blue-200/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                <Users className="h-6 w-6 mr-3 text-blue-600" />
                Lista de Usuários
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                {filteredUsers.length} usuário(s) encontrado(s)
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUsers}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/debug-users')
                    const data = await response.json()
                    console.log('🔍 DEBUG API Response:', data)
                    toast.info("Dados de debug logados no console")
                  } catch (error) {
                    console.error('❌ Erro no debug:', error)
                    toast.error("Erro ao buscar dados de debug")
                  }
                }}
                className="flex items-center space-x-2 bg-yellow-100 hover:bg-yellow-200"
              >
                <span>🐛 Debug</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('🔄 Forçando reload completo da página...')
                  window.location.reload()
                }}
                className="flex items-center space-x-2 bg-red-100 hover:bg-red-200"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/test-grah')
                    const data = await response.json()
                    console.log('🧪 TESTE GRAH:', data)
                    toast.info("Teste do Grah logado no console")
                  } catch (error) {
                    console.error('❌ Erro no teste:', error)
                    toast.error("Erro no teste")
                  }
                }}
                className="flex items-center space-x-2 bg-green-100 hover:bg-green-200"
              >
                <span>🧪 Teste</span>
              </Button>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                {users.filter(u => u.is_active).length} Ativos
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-50/50 via-cyan-50/30 to-teal-50/20 border-b border-blue-200/50">
                <TableHead className="font-semibold text-slate-700 py-4 px-6">Nome</TableHead>
                <TableHead className="font-semibold text-slate-700 py-4 px-6">E-mail</TableHead>
                <TableHead className="font-semibold text-slate-700 py-4 px-6">Telefone</TableHead>
                <TableHead className="font-semibold text-slate-700 py-4 px-6">Tipo</TableHead>
                <TableHead className="font-semibold text-slate-700 py-4 px-6">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 py-4 px-6">Último Acesso</TableHead>
                <TableHead className="w-[200px] py-4 px-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <FishTableLoading />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-blue-50/30 transition-colors duration-200 border-b border-gray-100/50">
                    <TableCell className="font-semibold text-slate-800 py-4 px-6 min-w-[200px]">{user.full_name}</TableCell>
                    <TableCell className="text-slate-600 py-4 px-6 min-w-[250px]">{user.email}</TableCell>
                    <TableCell className="text-slate-600 py-4 px-6 min-w-[150px]">{user.phone || "-"}</TableCell>
                    <TableCell className="py-4 px-6 min-w-[120px]">
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className={cn(
                          "font-semibold",
                          user.role === 'admin' 
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0" 
                            : "bg-gradient-to-r from-teal-500 to-green-500 text-white border-0"
                        )}
                      >
                        {user.role === 'admin' ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <Fish className="h-3 w-3 mr-1" />
                            Maricultor
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6 min-w-[120px]">
                      <Badge 
                        variant={user.is_active ? 'default' : 'destructive'}
                        className={cn(
                          "font-semibold",
                          user.is_active 
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0" 
                            : "bg-gradient-to-r from-orange-500 to-red-500 text-white border-0"
                        )}
                      >
                        {user.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Inativo
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 py-4 px-6 min-w-[140px]">
                      {user.last_sign_in_at ? (
                        (() => {
                          // Garantir parsing em todos os navegadores
                          const safe = user.last_sign_in_at.includes('T')
                            ? user.last_sign_in_at
                            : user.last_sign_in_at.replace(' ', 'T')
                          const d = new Date(safe)
                          return isNaN(d.getTime()) ? 'Nunca' : d.toLocaleDateString('pt-BR')
                        })()
                      ) : 'Nunca'}
                    </TableCell>
                    <TableCell className="py-4 px-6 w-[200px]">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="hover:bg-blue-100 rounded-lg transition-colors duration-200 p-2"
                          title="Editar usuário"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleStatus(user)}
                          className="hover:bg-orange-100 rounded-lg transition-colors duration-200 p-2"
                          title={user.is_active ? "Inativar usuário" : "Ativar usuário"}
                        >
                          {user.is_active ? (
                            <Clock className="h-4 w-4 text-orange-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleResendEmail(user)}
                          disabled={hasUserLoggedIn(user)}
                          className={cn(
                            "rounded-lg transition-colors duration-200 p-2",
                            hasUserLoggedIn(user) 
                              ? "opacity-50 cursor-not-allowed" 
                              : "hover:bg-purple-100"
                          )}
                          title={hasUserLoggedIn(user) ? "Usuário já fez login - não é possível reenviar e-mail" : "Reenviar e-mail"}
                        >
                          <Mail className={cn(
                            "h-4 w-4",
                            hasUserLoggedIn(user) ? "text-gray-400" : "text-purple-600"
                          )} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="hover:bg-red-100 rounded-lg transition-colors duration-200 p-2"
                          title="Excluir usuário"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modais de Confirmação */}
      
      {/* Modal de Confirmação para Exclusão */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({isOpen: false, user: null})}
        onConfirm={confirmDelete}
        title="Excluir Usuário"
        description={`Tem certeza que deseja excluir o usuário "${deleteConfirm.user?.full_name}"? Esta ação não pode ser desfeita e todos os dados serão permanentemente removidos.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="delete"
        icon={<Trash2 className="h-8 w-8 text-red-600" />}
      />

      {/* Modal de Confirmação para Alteração de Status */}
      <ConfirmationDialog
        isOpen={statusConfirm.isOpen}
        onClose={() => setStatusConfirm({isOpen: false, user: null})}
        onConfirm={confirmToggleStatus}
        title={statusConfirm.user?.is_active ? "Inativar Usuário" : "Ativar Usuário"}
        description={`Tem certeza que deseja ${statusConfirm.user?.is_active ? 'inativar' : 'ativar'} o usuário "${statusConfirm.user?.full_name}"?`}
        confirmText={statusConfirm.user?.is_active ? "Inativar" : "Ativar"}
        cancelText="Cancelar"
        variant="warning"
        icon={statusConfirm.user?.is_active ? 
          <UserX className="h-8 w-8 text-orange-600" /> : 
          <CheckCircle className="h-8 w-8 text-green-600" />
        }
      />

      {/* Modal de Confirmação para Reenvio de E-mail */}
      <ConfirmationDialog
        isOpen={emailConfirm.isOpen}
        onClose={() => setEmailConfirm({isOpen: false, user: null})}
        onConfirm={confirmResendEmail}
        title="Reenviar E-mail"
        description={`Deseja reenviar o e-mail de boas-vindas para "${emailConfirm.user?.full_name}"? Uma nova senha temporária será gerada e a senha atual será substituída.`}
        confirmText="Reenviar"
        cancelText="Cancelar"
        variant="info"
        icon={<Mail className="h-8 w-8 text-blue-600" />}
      />
    </div>
  )
}

