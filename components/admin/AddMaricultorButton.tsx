"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { AddMaricultorModal } from "./AddMaricultorModal"
import { useRouter } from "next/navigation"

export function AddMaricultorButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    router.refresh() // Recarregar a página para mostrar o novo maricultor
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="rounded-2xl px-5 bg-white text-blue-700 hover:bg-white/90 shadow-lg"
      >
        <UserPlus className="h-5 w-5 mr-2" />
        Novo Maricultor
      </Button>

      <AddMaricultorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}

