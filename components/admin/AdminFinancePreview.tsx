"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Users, Wallet } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis } from "recharts"

type Summary = {
  year: number
  total: number
  by_method: Record<string, number>
  isento_count: number
  active_maricultors_count: number
}

type MonthStat = { year: number; month: number; total: number; label: string }

const chartConfig = {
  total: { label: "Receita", color: "#d97706" },
}

export function AdminFinancePreview() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [monthly, setMonthly] = useState<MonthStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const year = new Date().getFullYear()
    Promise.all([
      fetch(`/api/admin/payments/summary?year=${year}`).then((r) => r.json()),
      fetch("/api/admin/payments/monthly-stats").then((r) => r.json()),
    ])
      .then(([summaryRes, monthlyRes]) => {
        if (summaryRes.error) setError(summaryRes.error)
        else setSummary(summaryRes)
        if (!monthlyRes.error) setMonthly(monthlyRes.months || [])
      })
      .catch(() => setError("Erro ao carregar"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 via-orange-50/30 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Módulo Financeiro</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Carregando dados
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 via-orange-50/30 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Módulo Financeiro</CardTitle>
          <CardDescription>Preview financeiro</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700">{error}</p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href="/admin/payments">Abrir Mensalidades</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const totalYear = summary?.total ?? 0
  const isentos = summary?.isento_count ?? 0
  const active = summary?.active_maricultors_count ?? 0
  const currentMonthTotal = monthly.length > 0 ? monthly[monthly.length - 1]?.total ?? 0 : 0

  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-amber-50 via-orange-50/30 to-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">Módulo Financeiro</CardTitle>
            <CardDescription className="mt-1">Preview — gestão de mensalidades</CardDescription>
          </div>
          <Button asChild size="sm" className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white">
            <Link href="/admin/payments">Ver Mensalidades</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPIs em linha */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-white/80 border border-amber-200/60 p-3">
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-medium">Mês atual</span>
            </div>
            <p className="text-lg font-bold text-slate-800">
              R$ {currentMonthTotal.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="rounded-xl bg-white/80 border border-amber-200/60 p-3">
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Ano {summary?.year}</span>
            </div>
            <p className="text-lg font-bold text-slate-800">
              R$ {totalYear.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="rounded-xl bg-white/80 border border-amber-200/60 p-3">
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Isentos</span>
            </div>
            <p className="text-lg font-bold text-slate-800">{isentos}</p>
          </div>
          <div className="rounded-xl bg-white/80 border border-amber-200/60 p-3">
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Associados</span>
            </div>
            <p className="text-lg font-bold text-slate-800">{active}</p>
          </div>
        </div>

        {/* Gráfico receita por mês */}
        {monthly.length > 0 && (
          <div className="rounded-xl bg-white/80 border border-amber-200/60 p-3">
            <p className="text-xs font-medium text-amber-700 mb-2">Receita por mês (últimos 12 meses)</p>
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `R$${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Receita"]} />
                <Bar dataKey="total" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
