"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AboutReaderModal } from "@/components/public/AboutReaderModal"

type HeroButtonsProps = {
  aboutBlocks: any[]
}

export function HeroButtons({ aboutBlocks }: HeroButtonsProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          size="lg" 
          className="text-base"
          asChild
        >
          <a href="#produtores">
            Conheça Nossos Produtores
          </a>
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="text-base bg-transparent"
          onClick={() => setShowModal(true)}
        >
          Saiba Mais
        </Button>
      </div>

      {/* Modal Conheça a AMESP */}
      {showModal && (
        <AboutReaderModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          blocks={aboutBlocks}
          title="Conheça a AMESP!"
        />
      )}
    </>
  )
}

