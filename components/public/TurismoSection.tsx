"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Fish, Users, Waves, Award, MapPin, Camera, Calendar } from "lucide-react"
import { AboutReaderModal } from "@/components/public/AboutReaderModal"

type TurismoSectionProps = {
  turismo: any
}

export function TurismoSection({ turismo }: TurismoSectionProps) {
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
    calendar: Calendar,
  }

  const features = turismo?.features || []
  const contentBlocks = turismo?.content?.content || []

  return (
    <>
      <div className="text-center space-y-4 mb-16">
        <Badge variant="outline" className="w-fit mx-auto">Turismo</Badge>
        <h2 className="font-sans font-bold text-3xl lg:text-4xl text-balance">
          {turismo?.content?.title || 'Turismo no Litoral'}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          {turismo?.content?.subtitle || 'Conheça as belezas e oportunidades de turismo na região da maricultura no litoral norte de São Paulo.'}
        </p>
      </div>

      {/* Roteiro: timeline horizontal 1 → 2 → 3 → 4 */}
      <div className="relative max-w-4xl mx-auto">
        <div className="hidden sm:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4">
          {features.slice(0, 4).map((f: any, idx: number) => {
            const key = String(f.icon_key || '').toLowerCase()
            const Icon = iconMap[key] || Waves
            return (
              <div key={idx} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border-2 border-primary/30 shadow-lg flex items-center justify-center mb-3">
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.description}</p>
              </div>
            )
          })}
        </div>
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
          title="Turismo"
        />
      )}
    </>
  )
}
