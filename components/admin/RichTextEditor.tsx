"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bold, Italic, Palette } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [fontSize, setFontSize] = useState('16')
  const [fontFamily, setFontFamily] = useState('Arial')

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

  const handleColorChange = (color: string) => {
    setCurrentColor(color)
    
    // Salvar a seleção atual
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      
      // Se houver texto selecionado, aplicar cor
      if (!range.collapsed) {
        document.execCommand('foreColor', false, color)
      } else {
        // Se não houver seleção, focar o editor e próximo texto digitado terá essa cor
        editorRef.current?.focus()
        document.execCommand('foreColor', false, color)
      }
    }
    
    updateContent()
  }

  const handleFontSizeChange = (size: string) => {
    setFontSize(size)
    document.execCommand('fontSize', false, '7')
    
    // Encontrar todos os elementos com font-size e ajustar
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0)
      const span = document.createElement('span')
      span.style.fontSize = `${size}px`
      try {
        range.surroundContents(span)
      } catch {
        // Fallback se houver elementos complexos
        document.execCommand('fontSize', false, '7')
        const fontElements = editorRef.current?.querySelectorAll('font[size="7"]')
        fontElements?.forEach((el) => {
          const newEl = document.createElement('span')
          newEl.style.fontSize = `${size}px`
          newEl.innerHTML = el.innerHTML
          el.replaceWith(newEl)
        })
      }
    }
    
    editorRef.current?.focus()
    updateContent()
  }

  const handleFontFamilyChange = (font: string) => {
    setFontFamily(font)
    document.execCommand('fontName', false, font)
    editorRef.current?.focus()
    updateContent()
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-t-lg bg-slate-50 flex-wrap">
        {/* Formatação de texto */}
        <div className="flex items-center gap-1">
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

        <div className="h-6 w-px bg-slate-300" />

        {/* Cor do texto */}
        <div className="relative flex items-center gap-2">
          <input
            ref={colorInputRef}
            type="color"
            value={currentColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="absolute opacity-0 w-0 h-0"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => colorInputRef.current?.click()}
            className="h-8 px-2 gap-1.5 hover:bg-slate-100"
            title="Selecione o texto e clique para mudar a cor"
          >
            <Palette className="h-4 w-4" />
            <div 
              className="w-5 h-5 rounded border-2 border-slate-400 shadow-sm"
              style={{ backgroundColor: currentColor }}
            />
          </Button>
        </div>

        <div className="h-6 w-px bg-slate-300" />

        {/* Tamanho da fonte */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">Tamanho:</span>
          <Select value={fontSize} onValueChange={handleFontSizeChange}>
            <SelectTrigger className="h-8 w-20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12px</SelectItem>
              <SelectItem value="14">14px</SelectItem>
              <SelectItem value="16">16px</SelectItem>
              <SelectItem value="18">18px</SelectItem>
              <SelectItem value="20">20px</SelectItem>
              <SelectItem value="24">24px</SelectItem>
              <SelectItem value="28">28px</SelectItem>
              <SelectItem value="32">32px</SelectItem>
              <SelectItem value="36">36px</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-6 w-px bg-slate-300" />

        {/* Família da fonte */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">Fonte:</span>
          <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Roboto">Roboto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          // Permitir Enter para quebra de linha natural
          if (e.key === 'Enter') {
            // Não previne o comportamento padrão, permite quebra de linha
            updateContent()
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

