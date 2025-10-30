"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

type Item = {
  id: string
  image_url: string
  title: string
  description?: string | null
  category?: string | null
  featured?: boolean | null
}

export default function GalleryGrid({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const ordered = useMemo(() => items, [items])

  const openAt = useCallback((i: number) => {
    setIndex(i)
    setOpen(true)
  }, [])

  const prev = useCallback(() => setIndex((i) => (i - 1 + ordered.length) % ordered.length), [ordered.length])
  const next = useCallback(() => setIndex((i) => (i + 1) % ordered.length), [ordered.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, prev, next])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {ordered.map((item, i) => {
          const isFeatured = item.featured && i === 0
          return (
            <div
              key={item.id}
              className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 rounded-xl shadow-lg relative ${
                isFeatured ? "md:col-span-2 md:row-span-2 aspect-[2/1] md:aspect-auto" : "aspect-square"
              }`}
              onClick={() => openAt(i)}
              role="button"
              tabIndex={0}
            >
              <div className="absolute inset-0">
                <Image src={item.image_url || "/placeholder.svg"} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
              <div className={`absolute text-white transition-all duration-300 opacity-100 ${isFeatured ? "bottom-6 left-6 right-6" : "bottom-4 left-4 right-4"}`}>
                {isFeatured && (
                  <Badge className="mb-2 bg-primary/90 text-primary-foreground">Destaque</Badge>
                )}
                <h3 className={`font-semibold mb-1 drop-shadow-lg ${isFeatured ? "text-2xl" : "text-lg"}`}>{item.title}</h3>
                {item.description && (
                  <p className={`text-white/95 drop-shadow-md ${isFeatured ? "text-base" : "text-sm"}`}>{item.description}</p>
                )}
                {item.category && <p className="text-white/80 text-xs mt-2">{item.category}</p>}
              </div>
            </div>
          )
        })}
      </div>

      {open && ordered[index] && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="relative w-full max-w-5xl h-[70vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={(e)=>{e.stopPropagation(); setOpen(false)}} className="absolute top-3 right-3 z-20 bg-white/90 rounded-full p-2 shadow hover:bg-white cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            <button onClick={(e)=>{e.stopPropagation(); prev()}} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 rounded-full p-2 shadow hover:bg-white cursor-pointer">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={(e)=>{e.stopPropagation(); next()}} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 rounded-full p-2 shadow hover:bg-white cursor-pointer">
              <ChevronRight className="h-6 w-6" />
            </button>
            <Image key={ordered[index].id} src={ordered[index].image_url} alt={ordered[index].title} fill className="object-contain rounded-lg select-none" />
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <div className="font-semibold">{ordered[index].title}</div>
              {ordered[index].description && <div className="text-sm opacity-90">{ordered[index].description}</div>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}


