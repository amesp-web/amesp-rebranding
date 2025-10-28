"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface NewsActionsProps {
  articleId: string
  published: boolean
}

export function NewsActions({ articleId, published }: NewsActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const togglePublished = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("news").update({ published: !published }).eq("id", articleId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error toggling publish status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteArticle = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("news").delete().eq("id", articleId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error deleting article:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-1">
      <Button variant="ghost" size="sm" onClick={togglePublished} disabled={isLoading}>
        {published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isLoading}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A notícia será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteArticle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
