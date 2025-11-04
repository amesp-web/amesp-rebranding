"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Fish, Users, Waves, Award, MapPin, Camera } from "lucide-react"
import { AboutReaderModal } from "@/components/public/AboutReaderModal"

type AboutSectionProps = {
  about: any
}

export function AboutSection({ about }: AboutSectionProps) {
  const [showModal, setShowModal] = useState(false)

  const iconMap: Record<string, any> = {
    fish: Fish,
    users: Users,
    waves: Waves,
    award: Award,
    mappin: MapPin,
    mappin2: MapPin,
    mapPin: MapPin,
    camera: Camera,
  }

  const features = about?.features || []
  const contentBlocks = about?.content?.content || []

  return (
    <>
      <div className="text-center space-y-4 mb-16">
        <Badge variant="outline" className="w-fit mx-auto">Quem Somos</Badge>
        <h2 className="font-sans font-bold text-3xl lg:text-4xl text-balance">
          {about?.content?.title || 'Realizamos projetos socioambientais e ações estratégicas'}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          {about?.content?.subtitle || 'Nossa missão é promover o desenvolvimento sustentável da maricultura, apoiando nossos associados com conhecimento técnico e científico.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.slice(0, 4).map((f: any, idx: number) => {
          const key = String(f.icon_key || '').toLowerCase()
          const Icon = iconMap[key] || Fish
          return (
            <Card key={idx} className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">{f.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Botão Conheça a AMESP */}
      <div className="flex justify-center mt-12">
        <Button
          size="lg"
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white shadow-md hover:shadow-lg transition-all duration-200 text-lg px-8 py-6"
        >
          Conheça a AMESP
        </Button>
      </div>

      {/* Modal de Leitura */}
      {showModal && (
        <AboutReaderModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          blocks={contentBlocks}
          title="Conheça a AMESP!"
        />
      )}
    </>
  )
}

