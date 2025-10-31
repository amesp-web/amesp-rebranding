"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bold, Italic } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    updateContent()
  }

  const updateContent = () => {
    if (editorRef.current) {
      let html = editorRef.current.innerHTML
      // Garantir que o conteúdo tenha estrutura de parágrafos
      // Se não tiver <p> ou <div>, envolver em <p>
      if (!html.trim()) {
        onChange('')
        return
      }
      // Se não tiver nenhuma tag, significa que é texto puro
      if (!html.match(/<\/?[a-z][\s\S]*>/i)) {
        // Converter quebras de linha duplas em parágrafos
        html = html.split(/\n\n+/).map(p => p.trim()).filter(p => p).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')
      }
      onChange(html)
    }
  }

  const isFormatActive = (format: string): boolean => {
    return document.queryCommandState(format)
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-t-lg bg-slate-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('bold')}
          className={`h-8 w-8 p-0 ${isFormatActive('bold') ? 'bg-blue-100 text-blue-700' : ''}`}
          title="Negrito (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('italic')}
          className={`h-8 w-8 p-0 ${isFormatActive('italic') ? 'bg-blue-100 text-blue-700' : ''}`}
          title="Itálico (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          // Converter Enter em parágrafo (<p>) ao invés de <br>
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            document.execCommand('formatBlock', false, 'p')
          }
        }}
        className={`min-h-[150px] p-4 border border-t-0 rounded-b-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''
        } [&_p]:mb-4 [&_p]:last:mb-0 [&_div]:mb-4 [&_div]:last:mb-0`}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
        suppressContentEditableWarning
        data-placeholder={placeholder || 'Digite a descrição do projeto...'}
      />
      
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

