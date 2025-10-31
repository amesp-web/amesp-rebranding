"use client"

import { useState } from "react"
import { X, Sparkles, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AISuggestion {
  titles: string[]
  lead: string
  structure: {
    sections: {
      subtitle: string
      topics: string[]
    }[]
  }
}

interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (suggestion: { title: string; content: string; excerpt: string }) => void
}

export function AIAssistantModal({ isOpen, onClose, onApply }: AIAssistantModalProps) {
  const [topic, setTopic] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedTitleIndex, setSelectedTitleIndex] = useState<number | null>(null)

  if (!isOpen) return null

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Por favor, informe o tópico da notícia")
      return
    }

    setIsGenerating(true)
    setError(null)
    setSuggestion(null)
    setSelectedTitleIndex(null)

    try {
      const response = await fetch("/api/ai-news-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Erro ao gerar sugestão")
      }

      const data = await response.json()
      setSuggestion(data)
      setSelectedTitleIndex(0) // Seleciona o primeiro título por padrão
    } catch (err: any) {
      console.error("Erro ao gerar sugestão:", err)
      setError(err.message || "Erro ao gerar sugestão. Tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApply = () => {
    if (!suggestion || selectedTitleIndex === null) return

    const selectedTitle = suggestion.titles[selectedTitleIndex]
    
    // Construir conteúdo estruturado
    let content = suggestion.lead + "\n\n"
    
    suggestion.structure.sections.forEach((section) => {
      content += `## ${section.subtitle}\n\n`
      section.topics.forEach((topic) => {
        content += `- ${topic}\n`
      })
      content += "\n"
    })

    onApply({
      title: selectedTitle,
      content: content.trim(),
      excerpt: suggestion.lead.substring(0, 200) + "...",
    })
    
    // Reset
    setTopic("")
    setSuggestion(null)
    setSelectedTitleIndex(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Assistente Criativo IA</h2>
              <p className="text-white/90 text-sm">Gere um esboço de notícia com IA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Input do tópico */}
          <div className="space-y-2">
            <Label htmlFor="topic">Sobre o que você quer escrever?</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Nova técnica de cultivo de ostras sustentável"
              disabled={isGenerating}
              className="border-2 border-blue-200/60 rounded-xl"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
                  e.preventDefault()
                  handleGenerate()
                }
              }}
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg rounded-xl"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando sugestão...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Esboço
                </>
              )}
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {isGenerating && !suggestion && (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded" />
              <div className="h-24 bg-gray-200 rounded" />
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          )}

          {/* Sugestão gerada */}
          {suggestion && !isGenerating && (
            <div className="space-y-6">
              {/* Títulos */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Títulos Sugeridos (escolha um):</Label>
                <div className="space-y-2">
                  {suggestion.titles.map((title, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTitleIndex(index)}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                        selectedTitleIndex === index
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex-shrink-0 ${
                          selectedTitleIndex === index ? "text-blue-600" : "text-gray-400"
                        }`}>
                          {selectedTitleIndex === index ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-current" />
                          )}
                        </div>
                        <span className={`font-medium ${
                          selectedTitleIndex === index ? "text-blue-900" : "text-gray-700"
                        }`}>
                          {title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Lead (Primeiro Parágrafo):</Label>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-gray-700 leading-relaxed">{suggestion.lead}</p>
                </div>
              </div>

              {/* Estrutura */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Estrutura Sugerida:</Label>
                <div className="space-y-4">
                  {suggestion.structure.sections.map((section, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">{section.subtitle}</h4>
                      <ul className="space-y-2">
                        {section.topics.map((topic, topicIdx) => (
                          <li key={topicIdx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-blue-600 mt-1.5">•</span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {suggestion && !isGenerating && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handleApply}
              disabled={selectedTitleIndex === null}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg rounded-xl px-6"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Usar no Formulário
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

