"use client"

import Image from "next/image"
import { useEffect } from "react"

interface FishSwarmProps {
  count?: number
  className?: string
}

interface FishConfig {
  position: { top: string; left: string }
  size: "sm" | "md" | "lg"
  rotation: number
  opacity: number
  delay: number
}

// Gera configurações aleatórias para múltiplos peixes
function generateFishConfig(count: number): FishConfig[] {
  const configs: FishConfig[] = []
  
  // Posições estratégicas (evitando centro onde tem conteúdo)
  const positionZones = [
    { top: "5%", left: "2%" },
    { top: "10%", left: "85%" },
    { top: "80%", left: "5%" },
    { top: "75%", left: "88%" },
    { top: "20%", left: "15%" },
    { top: "60%", left: "20%" },
    { top: "30%", left: "80%" },
    { top: "70%", left: "75%" },
  ]

  const sizes: ("sm" | "md" | "lg")[] = ["sm", "md", "lg"]
  
  for (let i = 0; i < count && i < positionZones.length; i++) {
    const zone = positionZones[i]
    configs.push({
      position: {
        top: zone.top,
        left: zone.left,
      },
      size: sizes[Math.floor(Math.random() * sizes.length)],
      rotation: Math.random() * 30 - 15, // -15° a +15°
      opacity: 0.4 + Math.random() * 0.4, // 40% a 80%
      delay: Math.random() * 2, // Delay para animação variada
    })
  }
  
  return configs
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-28 h-28",
}

export function FishSwarm({ count = 4, className = "" }: FishSwarmProps) {
  const fishes = generateFishConfig(count)

  useEffect(() => {
    // Adiciona keyframes CSS dinamicamente
    const styleId = 'fish-swarm-animation'
    if (document.getElementById(styleId)) return // Já existe
    
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @keyframes fishFloat {
        0%, 100% {
          transform: translateY(0px) rotate(var(--fish-rotation, 0deg));
        }
        50% {
          transform: translateY(-12px) rotate(var(--fish-rotation, 0deg));
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      const existing = document.getElementById(styleId)
      if (existing) document.head.removeChild(existing)
    }
  }, [])

  return (
    <div className={`absolute inset-0 pointer-events-none select-none ${className}`} aria-hidden="true">
      {fishes.map((fish, index) => {
        const duration = 3 + Math.random() * 2
        return (
          <div
            key={index}
            className="absolute"
            style={{
              top: fish.position.top,
              left: fish.position.left,
              opacity: fish.opacity,
              '--fish-rotation': `${fish.rotation}deg`,
              animation: `fishFloat ${duration}s ease-in-out infinite`,
              animationDelay: `${fish.delay}s`,
              transformOrigin: 'center center',
            } as React.CSSProperties & { '--fish-rotation': string }}
          >
            <div className={`${sizeClasses[fish.size]} relative`}>
              <Image
                src="/fishdecor.png"
                alt=""
                width={112}
                height={112}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

