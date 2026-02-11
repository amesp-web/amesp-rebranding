"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Fish, Waves, MapPin, Calendar } from "lucide-react"
import Link from "next/link"

const FEATURES = [
  { title: "Praias e Natureza", description: "Litoral preservado com praias, trilhas e paisagens que encantam visitantes.", icon_key: "waves" },
  { title: "Gastronomia", description: "Experiências gastronômicas com frutos do mar e culinária local.", icon_key: "fish" },
  { title: "Roteiros e Visitas", description: "Conheça fazendas de maricultura e a rotina dos produtores.", icon_key: "mapPin" },
  { title: "Eventos e Festivais", description: "Eventos que unem turismo, cultura e maricultura na região.", icon_key: "calendar" },
]

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  fish: Fish,
  waves: Waves,
  mapPin: MapPin,
  calendar: Calendar,
}

function PillsDemo({ features, iconMap }: { features: typeof FEATURES; iconMap: typeof iconMap }) {
  const [active, setActive] = useState(0)
  const f = features[active]
  const Icon = iconMap[f.icon_key] || Waves
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="p-4 flex flex-wrap gap-2 justify-center border-b border-slate-100">
        {features.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              active === idx
                ? "bg-primary text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div className="p-6 flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center sm:text-left">
          <h3 className="font-bold text-slate-800">{f.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{f.description}</p>
        </div>
      </div>
    </Card>
  )
}

export default function PreviewLayoutsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.06] to-accent/[0.08] py-12 px-4">
      <div className="container max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="mb-2">Preview</Badge>
          <h1 className="text-2xl font-bold text-slate-800">
            Alternativas de layout para Maricultura / Turismo
          </h1>
          <p className="text-muted-foreground text-sm">
            Mesmo conteúdo em formatos diferentes. Avalie qual faz mais sentido para o site.
          </p>
          <Link href="/" className="text-sm text-primary hover:underline inline-block mt-2">
            ← Voltar para a Home
          </Link>
        </div>

        {/* Opção A: Atual (4 cards) */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">
            Opção A — Atual (4 cards em linha)
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, idx) => {
              const Icon = iconMap[f.icon_key] || Waves
              return (
                <Card key={idx} className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                  <CardHeader>
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Opção B: Abas (Tabs) */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">
            Opção B — Abas (Tabs)
          </h2>
          <Card className="border-0 shadow-lg overflow-hidden">
            <Tabs defaultValue="0" className="w-full">
              <TabsList className="w-full grid grid-cols-4 h-auto p-1 bg-muted/60 rounded-b-none border-b">
                {FEATURES.map((f, idx) => (
                  <TabsTrigger key={idx} value={String(idx)} className="text-xs sm:text-sm py-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
                    {f.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              {FEATURES.map((f, idx) => {
                const Icon = iconMap[f.icon_key] || Waves
                return (
                  <TabsContent key={idx} value={String(idx)} className="m-0 p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      <div className="h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{f.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{f.description}</p>
                      </div>
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          </Card>
        </section>

        {/* Opção C: Accordion */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">
            Opção C — Accordion (expandir / recolher)
          </h2>
          <Card className="border-0 shadow-lg p-2">
            <Accordion type="single" collapsible className="w-full">
              {FEATURES.map((f, idx) => {
                const Icon = iconMap[f.icon_key] || Waves
                return (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border-slate-200/80 px-2">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium text-slate-800">{f.title}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4 pl-12">
                      {f.description}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </Card>
        </section>

        {/* Opção D: Card único com grid 2x2 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">
            Opção D — Card único com grid interno (2×2)
          </h2>
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/60">
              {FEATURES.map((f, idx) => {
                const Icon = iconMap[f.icon_key] || Waves
                return (
                  <div key={idx} className="p-6 flex gap-4 items-start">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800">{f.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{f.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </section>

        {/* Opção E: Lista horizontal compacta */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">
            Opção E — Faixa horizontal (ícone + título + linha)
          </h2>
          <Card className="border-0 shadow-lg p-4">
            <div className="flex flex-wrap gap-6 sm:gap-8 justify-center">
              {FEATURES.map((f, idx) => {
                const Icon = iconMap[f.icon_key] || Waves
                return (
                  <div key={idx} className="flex items-center gap-3 min-w-[200px] max-w-[260px]">
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 text-sm">{f.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{f.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </section>

        {/* ========== MAIS INOVADORAS (mesma identidade) ========== */}
        <div className="pt-8 border-t-2 border-primary/20">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Sugestões mais inovadoras</h2>
          <p className="text-sm text-muted-foreground mb-8">Mesma paleta e ícones, layout mais criativo.</p>
        </div>

        {/* Opção F: Bento grid (um destaque + três menores) */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">
            Opção F — Bento grid (1 destaque + 3 compactos)
          </h2>
          <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto">
            <div className="col-span-2 rounded-2xl border-0 shadow-lg bg-gradient-to-br from-primary/10 via-card to-cyan-50/50 p-6 flex flex-col sm:flex-row gap-4 items-center text-center sm:text-left">
              <div className="h-20 w-20 shrink-0 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center">
                {(function() { const Icon = iconMap[FEATURES[0].icon_key] || Waves; return <Icon className="h-10 w-10 text-primary" /> })()}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{FEATURES[0].title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{FEATURES[0].description}</p>
              </div>
            </div>
            {FEATURES.slice(1, 4).map((f, idx) => {
              const Icon = iconMap[f.icon_key] || Waves
              return (
                <div key={idx} className="rounded-xl border border-slate-200/80 bg-white/80 shadow-md p-4 flex gap-3 items-center">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{f.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{f.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Opção G: Roteiro / Timeline horizontal */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">
            Opção G — Roteiro (timeline horizontal 1 → 2 → 3 → 4)
          </h2>
          <div className="relative">
            <div className="hidden sm:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4">
              {FEATURES.map((f, idx) => {
                const Icon = iconMap[f.icon_key] || Waves
                return (
                  <div key={idx} className="relative flex flex-col items-center text-center">
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border-2 border-primary/30 shadow-lg flex items-center justify-center mb-3">
                      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">{f.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Opção H: Scroll horizontal com “peek” */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">
            Opção H — Carrossel horizontal (peek do próximo card)
          </h2>
          <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
            <div className="flex gap-4" style={{ minWidth: "min-content" }}>
              {FEATURES.map((f, idx) => {
                const Icon = iconMap[f.icon_key] || Waves
                return (
                  <div key={idx} className="w-[280px] shrink-0 rounded-2xl border-0 shadow-lg bg-gradient-to-br from-card to-card/50 p-5 flex flex-col items-center text-center">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-3">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-slate-800">{f.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{f.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">Arraste horizontalmente no desktop; no mobile deslize os cards.</p>
        </section>

        {/* Opção I: Pills / chips clicáveis */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">
            Opção I — Pills (escolha um para ver o conteúdo)
          </h2>
          <PillsDemo features={FEATURES} iconMap={iconMap} />
        </section>

        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          Escolha a opção que melhor combina com a identidade AMESP. Depois podemos aplicar na seção Turismo e/ou Maricultura.
        </div>
      </div>
    </div>
  )
}
