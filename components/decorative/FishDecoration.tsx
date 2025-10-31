import Image from "next/image"

interface FishDecorationProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "floating"
  size?: "sm" | "md" | "lg"
  opacity?: number
  className?: string
}

export function FishDecoration({ 
  position = "floating", 
  size = "md", 
  opacity = 0.15,
  className = "" 
}: FishDecorationProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
  }

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "floating": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  }

  return (
    <div
      className={`absolute ${positionClasses[position]} ${sizeClasses[size]} pointer-events-none select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <Image
        src="/fishdecor.png"
        alt=""
        width={128}
        height={128}
        className="w-full h-full object-contain"
        unoptimized
      />
    </div>
  )
}

