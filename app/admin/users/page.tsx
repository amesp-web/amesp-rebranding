"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Mail, Phone, Users, Shield, Fish, CheckCircle, Clock, UserPlus } from "lucide-react"
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
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
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
      
      const response = await fetch('/api/admin/users')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar usuários')
      }

      setUsers(result.users)
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error)
      toast.error("Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 Iniciando criação de usuário...', formData)
    setLoading(true)
    
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

        const result = await response.json()

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
      fetchUsers()
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error)
      toast.error(error.message || "Erro ao salvar usuário")
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
    setEditingUser(user)
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role
    })
    setIsDialogOpen(true)
  }

  const handleToggleStatus = async (user: User) => {
    try {
      // Aqui você implementaria a lógica para ativar/inativar usuário
      // Por enquanto, apenas um toast informativo
      toast.success(`Usuário ${user.email_confirmed_at ? 'inativado' : 'ativado'} com sucesso!`)
      fetchUsers() // Recarregar lista
    } catch (error: any) {
      console.error('Erro ao alterar status:', error)
      toast.error("Erro ao alterar status do usuário")
    }
  }

  const handleResendEmail = async (user: User) => {
    try {
      // Gerar nova senha temporária
      const tempPassword = generateTemporaryPassword()
      
      // Enviar e-mail
      await sendWelcomeEmail(user.email, tempPassword, user.full_name)
      
      toast.success("E-mail de boas-vindas reenviado!")
    } catch (error: any) {
      console.error('Erro ao reenviar e-mail:', error)
      toast.error("Erro ao reenviar e-mail")
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error

      toast.success("Usuário excluído com sucesso!")
      fetchUsers()
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error)
      toast.error("Erro ao excluir usuário")
    }
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                  onClick={() => console.log('🔘 Botão clicado!')}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-2 font-semibold disabled:opacity-50"
                >
                  {editingUser ? (
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
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
              {users.filter(u => u.email_confirmed_at).length} Ativos
            </Badge>
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
                <TableHead className="w-[80px] py-4 px-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Carregando usuários...
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
                  <TableRow key={user.id} className="hover:bg-blue-50/30 transition-colors duration-200">
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
                        variant={user.email_confirmed_at ? 'default' : 'destructive'}
                        className={cn(
                          "font-semibold",
                          user.email_confirmed_at 
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0" 
                            : "bg-gradient-to-r from-orange-500 to-red-500 text-white border-0"
                        )}
                      >
                        {user.email_confirmed_at ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pendente
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 py-4 px-6 min-w-[120px]">
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')
                        : 'Nunca'
                      }
                    </TableCell>
                    <TableCell className="py-4 px-6 w-[80px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:bg-blue-100 rounded-lg transition-colors duration-200"
                          >
                            <MoreHorizontal className="h-4 w-4 text-slate-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => handleEdit(user)}
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            <Edit className="mr-2 h-4 w-4 text-blue-600" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(user)} 
                            className="cursor-pointer hover:bg-orange-50"
                          >
                            {user.email_confirmed_at ? (
                              <>
                                <Clock className="mr-2 h-4 w-4 text-orange-600" />
                                <span>Inativar</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                <span>Ativar</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleResendEmail(user)} 
                            className="cursor-pointer hover:bg-purple-50"
                          >
                            <Mail className="mr-2 h-4 w-4 text-purple-600" />
                            <span>Reenviar E-mail</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(user.id)} 
                            className="cursor-pointer text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
