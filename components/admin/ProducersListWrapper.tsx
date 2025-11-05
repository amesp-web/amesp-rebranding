"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { AddMaricultorModal } from "./AddMaricultorModal"
import { useRouter } from "next/navigation"

interface ProducersListWrapperProps {
  children: React.ReactNode
}

export function ProducersListWrapper({ children }: ProducersListWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    router.refresh() // Recarregar a página para mostrar o novo maricultor
  }

  return (
    <>
      <div className="space-y-8">
        {/* Botão flutuante para adicionar */}
        <div className="fixed bottom-8 right-8 z-40">
          <Button
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white h-14 px-6"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Novo Maricultor
          </Button>
        </div>

        {children}
      </div>

      <AddMaricultorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}

