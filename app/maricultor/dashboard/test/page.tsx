"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Fish, MapPin, Phone, Mail, Award, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function TestMaricultorDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.08] to-accent/[0.12] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/5 via-background to-accent/5 rounded-xl p-6 border border-primary/10">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Fish className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">🧪 Dashboard de Teste</h1>
              <p className="text-muted-foreground">Área do Maricultor - Modo de Teste</p>
            </div>
          </div>
        </div>

        {/* Informações do Produtor */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Informações do Produtor</span>
            </CardTitle>
            <CardDescription>Dados do seu perfil de maricultor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome da Fazenda</label>
                  <p className="text-lg font-semibold">Fazenda Marinha Teste</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Localização</label>
                  <p className="text-lg">Ubatuba - SP</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Especialidades</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="secondary">Ostras</Badge>
                    <Badge variant="secondary">Mexilhões</Badge>
                    <Badge variant="secondary">Camarões</Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contato</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>contato@fazendateste.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>(12) 99999-9999</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Certificação</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm">ASC Certificado</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produção Mensal</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">2.5 ton</div>
              <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualidade da Água</CardTitle>
              <Fish className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">98%</div>
              <p className="text-xs text-muted-foreground">Excelente</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próxima Colheita</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">15 dias</div>
              <p className="text-xs text-muted-foreground">Ostras</p>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Gerencie sua produção e perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Fish className="h-6 w-6" />
                <span className="text-sm">Relatório de Produção</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <MapPin className="h-6 w-6" />
                <span className="text-sm">Localização</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Award className="h-6 w-6" />
                <span className="text-sm">Certificações</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Agenda</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Voltar */}
        <div className="text-center">
          <Link
            href="/login/test"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            ← Voltar para teste de login
          </Link>
        </div>
      </div>
    </div>
  )
}

