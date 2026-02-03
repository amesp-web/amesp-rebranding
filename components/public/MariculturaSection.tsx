"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Fish, Users, Waves, Award, MapPin, Camera } from "lucide-react"
import { AboutReaderModal } from "@/components/public/AboutReaderModal"

type MariculturaSectionProps = {
  maricultura: any
}

export function MariculturaSection({ maricultura }: MariculturaSectionProps) {
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

  const features = maricultura?.features || []
  const contentBlocks = maricultura?.content?.content || []

  return (
    <>
      <div className="text-center space-y-4 mb-16">
        <Badge variant="outline" className="w-fit mx-auto">Maricultura</Badge>
        <h2 className="font-sans font-bold text-3xl lg:text-4xl text-balance">
          {maricultura?.content?.title || 'O que é Maricultura'}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          {maricultura?.content?.subtitle || 'A maricultura é a criação de organismos marinhos em ambiente controlado, contribuindo para a segurança alimentar e o desenvolvimento sustentável do litoral.'}
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
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-center mt-12">
        <Button
          size="lg"
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#023299] to-cyan-500 hover:from-[#023299]/90 hover:to-cyan-500/90 text-white shadow-md hover:shadow-lg transition-all duration-200 text-lg px-8 py-6"
        >
          Saiba mais
        </Button>
      </div>

      {showModal && (
        <AboutReaderModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          blocks={contentBlocks}
          title="Maricultura"
        />
      )}
    </>
  )
}
