"use client"

import Image from "next/image"

export function LogoLink() {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <a 
      href="#" 
      className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
    >
      <Image
        src="/amesp_logo.png"
        alt="AMESP - Associação dos Maricultores do Estado de São Paulo"
        width={130}
        height={44}
        className="h-11 w-auto"
        priority
      />
    </a>
  )
}

