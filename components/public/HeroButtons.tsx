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
          className="text-base bg-gradient-to-r from-[#023299] to-cyan-500 hover:from-[#023299]/90 hover:to-cyan-500/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
          asChild
        >
          <a href="#produtores">
            Conheça Nossos Produtores
          </a>
        </Button>
        <Button 
          size="lg" 
          className="text-base bg-gradient-to-r from-[#023299] to-cyan-500 hover:from-[#023299]/90 hover:to-cyan-500/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
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

