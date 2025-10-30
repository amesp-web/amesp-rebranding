"use client"

import React from 'react'

interface FishLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function FishLoading({ size = 'md', text = 'Carregando dados...' }: FishLoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      {/* Container do peixinho */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Peixinho */}
        <div className="absolute inset-0 animate-swim">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-blue-500"
            fill="currentColor"
          >
            {/* Corpo do peixe */}
            <ellipse cx="50" cy="50" rx="35" ry="20" className="animate-pulse" />
            
            {/* Cauda */}
            <path
              d="M15 50 Q5 40 5 50 Q5 60 15 50"
              className="animate-wiggle"
            />
            
            {/* Barbatanas */}
            <ellipse cx="35" cy="35" rx="8" ry="12" className="animate-flutter" />
            <ellipse cx="35" cy="65" rx="8" ry="12" className="animate-flutter" />
            
            {/* Olho */}
            <circle cx="60" cy="45" r="6" fill="white" />
            <circle cx="62" cy="43" r="3" fill="currentColor" />
            
            {/* Detalhes do corpo */}
            <ellipse cx="45" cy="50" rx="3" ry="2" fill="rgba(255,255,255,0.3)" />
            <ellipse cx="55" cy="50" rx="2" ry="1" fill="rgba(255,255,255,0.2)" />
          </svg>
        </div>
        
        {/* Bolhas */}
        <div className="absolute inset-0">
          <div className="absolute top-2 left-8 w-2 h-2 bg-blue-300 rounded-full animate-bubble opacity-60"></div>
          <div className="absolute top-6 left-12 w-1 h-1 bg-blue-400 rounded-full animate-bubble-delayed opacity-40"></div>
          <div className="absolute top-4 left-16 w-1.5 h-1.5 bg-blue-200 rounded-full animate-bubble-slow opacity-50"></div>
        </div>
      </div>
      
      {/* Texto de loading */}
      <div className={`text-center ${textSizeClasses[size]}`}>
        <div className="text-gray-600 font-medium">{text}</div>
        <div className="flex items-center justify-center space-x-1 mt-2">
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

// Componente para loading em tabelas
export function FishTableLoading({ text = 'Carregando usuários...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <FishLoading size="md" text={text} />
    </div>
  )
}

// Componente para loading em modais
export function FishModalLoading() {
  return (
    <div className="flex items-center justify-center py-8">
      <FishLoading size="sm" text="Processando..." />
    </div>
  )
}
