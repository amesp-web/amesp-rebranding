"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, User, Mail, Phone, MapPin, IdCard, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AddMaricultorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddMaricultorModal({ isOpen, onClose, onSuccess }: AddMaricultorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    cep: "",
    logradouro: "",
    numero: "",
    cidade: "",
    estado: "",
    company: "",
    specialties: "",
  })
  const [loading, setLoading] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState("")

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Máscara de CPF: 000.000.000-00
    if (name === 'cpf') {
      const onlyDigits = value.replace(/\D/g, '')
      const masked = onlyDigits
        .slice(0, 11)
        .replace(/(\d{3})(\d{0,3})(\d{0,3})(\d{0,2})/, (_, a, b, c, d) => {
          let result = a
          if (b) result += '.' + b
          if (c) result += '.' + c
          if (d) result += '-' + d
          return result
        })
      setFormData(prev => ({ ...prev, cpf: masked }))
      return
    }
    
    // Máscara de telefone
    if (name === 'phone') {
      const onlyDigits = value.replace(/\D/g, '')
      let masked = onlyDigits
      
      if (onlyDigits.length <= 10) {
        masked = onlyDigits
          .slice(0, 10)
          .replace(/(\d{2})(\d{0,4})(\d{0,4})/, (_, ddd, part1, part2) => {
            if (part2) return `(${ddd}) ${part1}-${part2}`
            if (part1) return `(${ddd}) ${part1}`
            if (ddd) return `(${ddd}`
            return ''
          })
      } else {
        masked = onlyDigits
          .slice(0, 11)
          .replace(/(\d{2})(\d{5})(\d{0,4})/, (_, ddd, part1, part2) => {
            if (part2) return `(${ddd}) ${part1}-${part2}`
            if (part1) return `(${ddd}) ${part1}`
            return `(${ddd}`
          })
      }
      
      setFormData(prev => ({ ...prev, phone: masked }))
      return
    }
    
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const onlyDigits = raw.replace(/\D/g, "")
    const masked = onlyDigits
      .slice(0, 8)
      .replace(/(\d{5})(\d{1,3})?/, (_, a: string, b?: string) => (b ? `${a}-${b}` : a))
    setFormData((prev) => ({ ...prev, cep: masked }))
    setCepError("")
    
    if (onlyDigits.length < 8) return
    
    setCepLoading(true)
    
    try {
      const resViaCep = await fetch(`https://viacep.com.br/ws/${onlyDigits}/json/`, { cache: 'no-store' })
      
      if (resViaCep.ok) {
        const dataViaCep = await resViaCep.json()
        
        if (!dataViaCep?.erro) {
          setFormData((prev) => ({ 
            ...prev, 
            logradouro: dataViaCep.logradouro || '',
            cidade: dataViaCep.localidade || '',
            estado: dataViaCep.uf || ''
          }))
        } else {
          setCepError('CEP não encontrado')
        }
      }
    } catch (err) {
      setCepError('Erro ao buscar CEP')
    } finally {
      setCepLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validações
    if (!formData.name || !formData.email || !formData.cpf) {
      toast.error("Preencha todos os campos obrigatórios")
      setLoading(false)
      return
    }

    // Validar CPF (11 dígitos)
    const cpfDigits = formData.cpf.replace(/\D/g, '')
    if (cpfDigits.length !== 11) {
      toast.error("CPF deve ter 11 dígitos")
      setLoading(false)
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Email inválido")
      setLoading(false)
      return
    }

    try {
      // Chamar API para cadastrar maricultor pelo admin
      const response = await fetch('/api/admin/maricultors/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          cpf: cpfDigits,
          phone: formData.phone,
          cep: formData.cep.replace(/\D/g, ''),
          logradouro: [formData.logradouro, formData.numero].filter(Boolean).join(', '),
          cidade: formData.cidade,
          estado: formData.estado,
          company: formData.company,
          specialties: formData.specialties,
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("Maricultor cadastrado com sucesso!")
        onSuccess()
        onClose()
        
        // Resetar formulário
        setFormData({
          name: "",
          email: "",
          cpf: "",
          phone: "",
          cep: "",
          logradouro: "",
          numero: "",
          cidade: "",
          estado: "",
          company: "",
          specialties: "",
        })
      } else {
        toast.error(data.error || "Erro ao cadastrar maricultor")
      }
    } catch (error) {
      toast.error("Erro ao cadastrar maricultor. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Cadastrar Novo Maricultor</h2>
              <p className="text-white/90 text-sm">Preencha os dados do produtor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Content - Scrollável */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Dados Pessoais */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Dados Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nome completo do maricultor"
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      placeholder="000.000.000-00"
                      required
                      maxLength={14}
                      className="rounded-xl pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Senha gerada: primeiros 6 dígitos do CPF
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@exemplo.com"
                      required
                      className="rounded-xl pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      className="rounded-xl pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Endereço
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      name="cep"
                      inputMode="numeric"
                      value={formData.cep}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      maxLength={9}
                      className={`rounded-xl ${cepError ? 'border-red-300' : ''}`}
                      disabled={cepLoading}
                    />
                    {cepLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                  {cepError && <p className="text-xs text-red-600">{cepError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado (UF)</Label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Selecione</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder="Ex: Ubatuba"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    name="logradouro"
                    value={formData.logradouro}
                    onChange={handleChange}
                    placeholder="Rua, avenida..."
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    placeholder="Nº"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Empresa/Especialidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Empresa/Fazenda</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Nome da empresa ou fazenda aquícola"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialties">Especialidades</Label>
                <Input
                  id="specialties"
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleChange}
                  placeholder="Ex: Cultivo de ostras, mexilhões..."
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3 flex-shrink-0">
          <p className="text-sm text-muted-foreground">
            * Campos obrigatórios • Senha: 6 primeiros dígitos do CPF
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg rounded-xl px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Cadastrar Maricultor
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

