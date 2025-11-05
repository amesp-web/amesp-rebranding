"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { EditMaricultorModal } from "./EditMaricultorModal"

interface EditMaricultorButtonProps {
  maricultor: {
    id: string
    full_name: string
    cpf?: string
    contact_phone?: string
    logradouro?: string
    cidade?: string
    estado?: string
    cep?: string
    company?: string
    specialties?: string
  }
}

export function EditMaricultorButton({ maricultor }: EditMaricultorButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
        title="Editar maricultor"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <EditMaricultorModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        maricultor={maricultor}
      />
    </>
  )
}

