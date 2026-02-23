"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Loader2, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  peixe: "Peixe",
  materiais: "Materiais",
  outros: "Outros",
  isento: "Isento",
}

type PaymentRow = {
  id: string
  maricultor_id: string
  year: number
  month: number
  amount: number | null
  payment_method: string | null
  paid_at: string | null
  notes: string | null
}

type MaricultorRow = {
  id: string
  full_name: string | null
  monthly_fee_amount: number | null
  association_date: string | null
  fee_exempt: boolean
  created_at: string | null
  payments: (PaymentRow | null)[]
}

type Summary = {
  year: number
  total: number
  by_method: Record<string, number>
  isento_count?: number
  active_maricultors_count: number
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

/** Formata data "só dia" (ex.: data de associação) sem conversão de fuso — evita 13/01 virar 12/01 no Brasil. */
function formatDateOnly(value: string | null | undefined): string {
  if (!value) return "—"
  const s = value.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "—"
  const [y, m, d] = s.split("-")
  return `${d}/${m}/${y}`
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleDateString("pt-BR")
  } catch {
    return "—"
  }
}

export default function PaymentsPage() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [maricultors, setMaricultors] = useState<MaricultorRow[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [modalMaricultor, setModalMaricultor] = useState<MaricultorRow | null>(null)
  const [modalMonth, setModalMonth] = useState<number>(1)
  const [modalPayment, setModalPayment] = useState<PaymentRow | null>(null)

  const [formAmount, setFormAmount] = useState<string>("")
  const [formMethod, setFormMethod] = useState<string>("dinheiro")
  const [formPaidAt, setFormPaidAt] = useState<string>("")
  const [formNotes, setFormNotes] = useState<string>("")
  const [formSaving, setFormSaving] = useState(false)
  const [formDeleting, setFormDeleting] = useState(false)
  const [searchName, setSearchName] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const filteredMaricultors = useMemo(() => {
    if (!searchName.trim()) return maricultors
    const term = searchName.trim().toLowerCase()
    return maricultors.filter((m) => (m.full_name || "").toLowerCase().includes(term))
  }, [maricultors, searchName])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [resPayments, resSummary] = await Promise.all([
        fetch(`/api/admin/payments?year=${year}`),
        fetch(`/api/admin/payments/summary?year=${year}`),
      ])
      if (!resPayments.ok) throw new Error("Erro ao carregar pagamentos")
      if (!resSummary.ok) throw new Error("Erro ao carregar resumo")
      const dataPayments = await resPayments.json()
      const dataSummary = await resSummary.json()
      setMaricultors(dataPayments.maricultors || [])
      setSummary(dataSummary)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar")
      setMaricultors([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openCreate = (m: MaricultorRow, month: number) => {
    setModalMode("create")
    setModalMaricultor(m)
    setModalMonth(month)
    setModalPayment(null)
    setFormAmount("")
    setFormMethod("dinheiro")
    setFormPaidAt(new Date().toISOString().slice(0, 10))
    setFormNotes("")
    setModalOpen(true)
  }

  const openEdit = (m: MaricultorRow, month: number, payment: PaymentRow) => {
    setModalMode("edit")
    setModalMaricultor(m)
    setModalMonth(month)
    setModalPayment(payment)
    setFormAmount(payment.amount != null ? String(payment.amount) : "")
    setFormMethod(payment.payment_method || "outros")
    setFormPaidAt(payment.paid_at ? payment.paid_at.slice(0, 10) : new Date().toISOString().slice(0, 10))
    setFormNotes(payment.notes || "")
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalMaricultor(null)
    setModalPayment(null)
  }

  const handleSave = async () => {
    if (!modalMaricultor) return
    setFormSaving(true)
    try {
      if (modalMode === "create") {
        const isIsento = formMethod === "isento"
        const res = await fetch("/api/admin/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            maricultor_id: modalMaricultor.id,
            year,
            month: modalMonth,
            amount: isIsento ? null : (formAmount ? parseFloat(formAmount.replace(",", ".")) : null),
            payment_method: formMethod,
            paid_at: isIsento ? null : (formPaidAt || new Date().toISOString()),
            notes: formNotes || null,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Erro ao registrar")
        }
        toast.success("Pagamento registrado.")
      } else if (modalPayment) {
        const isIsento = formMethod === "isento"
        const res = await fetch(`/api/admin/payments/${modalPayment.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: isIsento ? null : (formAmount ? parseFloat(formAmount.replace(",", ".")) : null),
            payment_method: formMethod,
            paid_at: isIsento ? null : (formPaidAt || null),
            notes: formNotes || null,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Erro ao atualizar")
        }
        toast.success("Pagamento atualizado.")
      }
      closeModal()
      fetchData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setFormSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!modalPayment) return
    setFormDeleting(true)
    try {
      const res = await fetch(`/api/admin/payments/${modalPayment.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao remover")
      }
      toast.success("Pagamento removido.")
      closeModal()
      setShowDeleteConfirm(false)
      fetchData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao remover")
    } finally {
      setFormDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-emerald-600" />
            Mensalidades
          </h1>
          <p className="text-slate-600 mt-1">
            Controle de pagamentos por maricultor. Clique em um mês para registrar ou editar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar por nome..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-9 w-[220px] sm:w-[260px] border-slate-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-slate-700">Ano</Label>
            <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v, 10))}>
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total no ano</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Dinheiro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-slate-800">{formatCurrency(summary.by_method.dinheiro)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">PIX</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-slate-800">{formatCurrency(summary.by_method.pix)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Peixe / Materiais / Outros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-slate-800">
                {formatCurrency(
                  (summary.by_method.peixe || 0) +
                    (summary.by_method.materiais || 0) +
                    (summary.by_method.outros || 0)
                )}
              </p>
            </CardContent>
          </Card>
          {typeof summary.isento_count === "number" && summary.isento_count > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Meses isentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-slate-800">{summary.isento_count} registro(s)</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pagamentos {year}</CardTitle>
          <CardDescription>
            {searchName.trim()
              ? `${filteredMaricultors.length} maricultor(es) encontrado(s) • Clique em uma célula para registrar ou editar`
              : "Maricultores ativos • Clique em uma célula para registrar ou editar o pagamento do mês"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : maricultors.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Nenhum maricultor ativo. Ative maricultores em Maricultores para aparecer aqui.
            </div>
          ) : filteredMaricultors.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Nenhum maricultor encontrado para &quot;{searchName.trim()}&quot;. Tente outro nome.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="min-w-[200px] sticky left-0 z-10 bg-slate-50 font-semibold">Maricultor</TableHead>
                  <TableHead className="min-w-[120px] sticky left-0 z-10 bg-slate-50 font-semibold">Associação</TableHead>
                  {MONTH_NAMES.map((name, i) => (
                    <TableHead key={i} className="text-center min-w-[100px] font-semibold">
                      {name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaricultors.map((m) => (
                  <TableRow key={m.id} className="group hover:bg-slate-50/50">
                    <TableCell className="font-medium sticky left-0 z-10 bg-white group-hover:bg-slate-50/50 border-r border-slate-100">
                      <span className="flex items-center gap-2">
                        {m.full_name || "—"}
                        {m.fee_exempt && (
                          <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            Isento
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/50 border-r border-slate-100 text-slate-600">
                      {formatDateOnly(m.association_date) !== "—" ? formatDateOnly(m.association_date) : formatDate(m.created_at)}
                    </TableCell>
                    {m.payments.map((payment, i) => {
                      const month = i + 1
                      return (
                        <TableCell key={month} className="p-1 text-center align-middle">
                          {payment ? (
                            <button
                              type="button"
                              onClick={() => openEdit(m, month, payment)}
                              className={cn(
                                "w-full min-h-[44px] rounded-lg border transition-colors",
                                "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                              )}
                              title="Editar pagamento"
                            >
                              <span className="text-xs font-medium block">
                                {formatCurrency(payment.amount)}
                              </span>
                              <span className="text-xs text-emerald-600">
                                {PAYMENT_METHOD_LABELS[payment.payment_method || ""] || payment.payment_method || "—"}
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openCreate(m, month)}
                              className="w-full min-h-[44px] rounded-lg border border-dashed border-slate-250 bg-slate-50/50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1"
                              title="Registrar pagamento"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" ? "Registrar pagamento" : "Editar pagamento"}
            </DialogTitle>
            <DialogDescription>
              {modalMaricultor?.full_name} • {MONTH_NAMES[modalMonth - 1]} {year}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Forma de pagamento</Label>
              <Select value={formMethod} onValueChange={setFormMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formMethod === "isento" ? (
              <p className="text-sm text-muted-foreground">
                Para isento, não é necessário informar valor ou data. Apenas observação, se quiser.
              </p>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label>Valor (opcional — não há valor fixo)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Data do pagamento</Label>
                  <Input
                    type="date"
                    value={formPaidAt}
                    onChange={(e) => setFormPaidAt(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="grid gap-2">
              <Label>Observações (opcional)</Label>
              <Input
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder={formMethod === "isento" ? "Ex: mês isento conforme deliberação" : "Ex: pago em espécie"}
              />
            </div>
          </div>
          <DialogFooter className="flex-row gap-2 sm:justify-between">
            <div>
              {modalMode === "edit" && modalPayment && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={formDeleting}
                >
                  {formDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remover"}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={formSaving}>
                {formSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Remover registro de pagamento?"
        description="Esta ação não pode ser desfeita. O registro deste mês será excluído."
        confirmText="Remover"
        cancelText="Cancelar"
        variant="delete"
        icon={<Trash2 className="h-8 w-8 text-red-600" />}
      />
    </div>
  )
}
