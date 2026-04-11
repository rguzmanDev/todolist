'use client'

import { useState, useRef, useEffect } from 'react'
import { FileText, Trash2, X, Save } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import type { Note, UpdateNotePayload } from '@/lib/types'

// Parse content lines into segments
function parseContent(content: string): { type: 'text' | 'check'; text: string; checked: boolean }[] {
  return content.split('\n').map((line) => {
    if (line.startsWith('- [x] ')) return { type: 'check', text: line.slice(6), checked: true }
    if (line.startsWith('- [ ] ')) return { type: 'check', text: line.slice(6), checked: false }
    return { type: 'text', text: line, checked: false }
  })
}

interface NoteEditorProps {
  note?: Note
  bookId: string
  sectionId?: string | null
  onClose: () => void
}

export default function NoteEditor({ note, bookId, sectionId, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [saving, setSaving] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const isEditing = Boolean(note)

  const createNote = useAppStore((s) => s.createNote)
  const updateNote = useAppStore((s) => s.updateNote)

  // Auto-resize textarea
  useEffect(() => {
    const ta = contentRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${ta.scrollHeight}px`
    }
  }, [content])

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      toast.error('La nota no puede estar vacía')
      return
    }
    setSaving(true)
    try {
      if (isEditing && note) {
        await updateNote(note.id, { title: title.trim(), content })
        toast.success('Nota guardada')
      } else {
        await createNote({ bookId, sectionId: sectionId ?? null, title: title.trim(), content })
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  // Keyboard shortcut: Ctrl/Cmd+Enter to save
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  // Toggle a checklist item in content
  const toggleCheckItem = (lineIndex: number, checked: boolean) => {
    const lines = content.split('\n')
    const line = lines[lineIndex]
    if (checked) {
      lines[lineIndex] = line.replace(/^- \[x\] /, '- [ ] ')
    } else {
      lines[lineIndex] = line.replace(/^- \[ \] /, '- [x] ')
    }
    setContent(lines.join('\n'))
  }

  const segments = parseContent(content)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex w-full max-w-2xl flex-col rounded-2xl shadow-2xl"
        style={{ backgroundColor: 'var(--color-bg)', maxHeight: '90vh' }}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: 'var(--color-border-light)' }}>
          <div className="flex items-center gap-2" style={{ color: 'var(--color-text-tertiary)' }}>
            <FileText size={15} />
            <span className="text-xs">{isEditing ? 'Editar nota' : 'Nueva nota'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>⌘↵ para guardar</span>
            <button
              onClick={onClose}
              className="rounded-md p-1 transition-opacity hover:opacity-60"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5 gap-3">
          {/* Title */}
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            className="w-full bg-transparent text-xl font-semibold outline-none placeholder:opacity-30"
            style={{ color: 'var(--color-text-primary)' }}
          />

          {/* Divider */}
          <div className="border-t" style={{ borderColor: 'var(--color-border-light)' }} />

          {/* Content textarea */}
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={'Escribe tu nota aquí...\n\nUsa "- [ ] texto" para agregar ítems de lista'}
            className="w-full resize-none bg-transparent text-sm outline-none leading-relaxed placeholder:opacity-30"
            style={{ color: 'var(--color-text-primary)', minHeight: '180px' }}
          />

          {/* Live checklist preview */}
          {segments.some((s) => s.type === 'check') && (
            <div className="border-t pt-3" style={{ borderColor: 'var(--color-border-light)' }}>
              <p className="mb-2 text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Vista previa de lista</p>
              <div className="flex flex-col gap-1.5">
                {segments.map((seg, i) =>
                  seg.type === 'check' ? (
                    <button
                      key={i}
                      onClick={() => toggleCheckItem(i, seg.checked)}
                      className="flex items-center gap-2 text-left text-sm"
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors',
                          seg.checked
                            ? 'text-white'
                            : 'hover:border-[var(--color-sidebar-accent)]'
                        )}
                        style={seg.checked
                          ? { borderColor: 'var(--color-sidebar-accent)', backgroundColor: 'var(--color-sidebar-accent)' }
                          : { borderColor: 'var(--color-border-medium)' }
                        }
                      >
                        {seg.checked && (
                          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 fill-none stroke-current" strokeWidth={2.5}>
                            <path d="M1.5 5L4 7.5L8.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className={cn('text-sm', seg.checked && 'line-through opacity-50')} style={{ color: 'var(--color-text-primary)' }}>
                        {seg.text}
                      </span>
                    </button>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t px-5 py-3" style={{ borderColor: 'var(--color-border-light)' }}>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-1.5 text-sm transition-colors"
            style={{ backgroundColor: 'var(--color-button-secondary-bg)', color: 'var(--color-button-secondary-text)', border: '1px solid var(--color-button-secondary-border)' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-button-primary-bg)', color: '#fff' }}
          >
            <Save size={13} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
