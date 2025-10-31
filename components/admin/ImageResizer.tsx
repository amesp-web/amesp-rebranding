"use client"

import { useState, useRef, useEffect } from "react"
import { GripVertical } from "lucide-react"

interface ImageResizerProps {
  imageUrl: string
  initialSize?: { width: number; height: number }
  onSizeChange: (size: { width: number; height: number }) => void
  minSize?: number
  maxSize?: number
}

export function ImageResizer({ imageUrl, initialSize, onSizeChange, minSize = 64, maxSize = 512 }: ImageResizerProps) {
  const [size, setSize] = useState(initialSize || { width: 200, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialSize) {
      setSize(initialSize)
    }
  }, [initialSize])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = size.width
    const startHeight = size.height
    const aspectRatio = startWidth / startHeight

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      
      // Usar a maior mudança (diagonal) para manter proporção
      const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY)) * (deltaX > 0 || deltaY > 0 ? 1 : -1)
      
      // Calcular nova largura e altura mantendo proporção
      let newWidth = startWidth + delta
      let newHeight = startHeight + delta
      
      // Limitar dentro dos limites
      newWidth = Math.max(minSize, Math.min(maxSize, newWidth))
      newHeight = Math.max(minSize, Math.min(maxSize, newHeight))
      
      // Manter proporção
      if (newWidth / newHeight !== aspectRatio) {
        newHeight = newWidth / aspectRatio
        if (newHeight > maxSize) {
          newHeight = maxSize
          newWidth = newHeight * aspectRatio
        }
        if (newHeight < minSize) {
          newHeight = minSize
          newWidth = newHeight * aspectRatio
        }
      }
      
      const newSize = { width: Math.round(newWidth), height: Math.round(newHeight) }
      setSize(newSize)
      onSizeChange(newSize)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        ref={containerRef}
        className="relative inline-flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-blue-300 p-4"
        style={{ width: size.width + 40, height: size.height + 40 }}
      >
        <div
          className="relative"
          style={{ width: size.width, height: size.height }}
        >
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-contain"
            style={{ width: size.width, height: size.height }}
          />
          {/* Handle no canto inferior direito */}
          <div
            className={`absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full border-4 border-white shadow-xl cursor-nwse-resize flex items-center justify-center transform translate-x-1/2 translate-y-1/2 transition-colors ${isDragging ? 'scale-110 bg-blue-800' : ''}`}
            onMouseDown={handleMouseDown}
            style={{ zIndex: 10 }}
            title="Arraste para redimensionar"
          >
            <div className="flex flex-col gap-0.5">
              <div className="w-2 h-0.5 bg-white rounded"></div>
              <div className="w-2 h-0.5 bg-white rounded"></div>
              <div className="w-2 h-0.5 bg-white rounded"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-sm text-slate-600">
        Tamanho: {Math.round(size.width)} x {Math.round(size.height)}px
      </div>
      <p className="text-xs text-slate-500 text-center">
        💡 Arraste o ponto azul no canto para redimensionar
      </p>
    </div>
  )
}

