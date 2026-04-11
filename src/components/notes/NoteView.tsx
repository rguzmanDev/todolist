'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, CheckSquare, Save } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import type { Note } from '@/lib/types'

function useIsMac() {
  const [isMac, setIsMac] = useState(false)
  useEffect(() => {
    setIsMac(
      typeof navigator !== 'undefined' &&
        (navigator.platform.toLowerCase().includes('mac') ||
          navigator.userAgent.toLowerCase().includes('mac'))
    )
  }, [])
  return isMac
}

export default function NoteView() {
  const activeNote = useAppStore((s) => s.activeNote)
  const setActiveNote = useAppStore((s) => s.setActiveNote)
  const selectedBookId = useAppStore((s) => s.selectedBookId)
  const selectedSectionId = useAppStore((s) => s.selectedSectionId)
  const createNote = useAppStore((s) => s.createNote)
  const updateNote = useAppStore((s) => s.updateNote)

  const existingNote = activeNote !== 'new' && activeNote !== null ? (activeNote as Note) : null

  const [title, setTitle] = useState(existingNote?.title ?? '')
  const [content, setContent] = useState(existingNote?.content ?? '')
  const [saving, setSaving] = useState(false)

  const contentRef = useRef<HTMLTextAreaElement>(null)
  const isMac = useIsMac()
  const shortcut = isMac ? '⌘↵' : 'Ctrl+↵'

  useEffect(() => {
    const ta = contentRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${ta.scrollHeight}px`
    }
  }, [content])

  const handleSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) {
      toast.error('La nota no puede estar vacía')
      return
    }
    setSaving(true)
    try {
      if (existingNote) {
        await updateNote(existingNote.id, { title: title.trim(), content })
      } else if (selectedBookId) {
        await createNote({ bookId: selectedBookId, sectionId: selectedSectionId ?? null, title: title.trim(), content })
      }
      toast.success('Nota guardada')
    } finally {
      setSaving(false)
    }
  }, [title, content, existingNote, selectedBookId, selectedSectionId, createNote, updateNote])

  const insertChecklist = () => {
    const ta = contentRef.current
    if (!ta) return
    const pos = ta.selectionStart
    const before = content.slice(0, pos)
    const after = content.slice(ta.selectionEnd)
    const lineStart = before.lastIndexOf('\n') + 1
    const lineContent = before.slice(lineStart)
    if (lineContent.startsWith('- [ ] ') || lineContent.startsWith('- [x] ')) {
      ta.focus()
      return
    }
    const needsNewLine = before.length > 0 && !before.endsWith('\n') && lineContent.trim().length > 0
    const insertion = needsNewLine ? '\n- [ ] ' : '- [ ] '
    const newContent =
      before.slice(0, needsNewLine ? pos : lineStart) +
      insertion +
      (needsNewLine ? '' : lineContent) +
      after
    setContent(newContent)
    const newPos = (needsNewLine ? pos : lineStart) + insertion.length + (needsNewLine ? 0 : lineContent.length)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
      return
    }
    if (e.key === 'Enter') {
      const ta = contentRef.current!
      const pos = ta.selectionStart
      const textBefore = content.slice(0, pos)
      const lineStart = textBefore.lastIndexOf('\n') + 1
      const lineEnd = content.indexOf('\n', pos) === -1 ? content.length : content.indexOf('\n', pos)
      const currentLine = content.slice(lineStart, lineEnd)
      if (currentLine === '- [ ] ' || currentLine === '- [x] ') {
        e.preventDefault()
        const newContent = content.slice(0, lineStart) + content.slice(lineStart + currentLine.length)
        setContent(newContent)
        setTimeout(() => ta.setSelectionRange(lineStart, lineStart), 0)
      } else if (currentLine.startsWith('- [ ] ') || currentLine.startsWith('- [x] ')) {
        e.preventDefault()
        const newContent = content.slice(0, pos) + '\n- [ ] ' + content.slice(pos)
        setContent(newContent)
        setTimeout(() => ta.setSelectionRange(pos + 7, pos + 7), 0)
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div
        className="flex items-center justify-between border-b px-4 py-2.5 shrink-0"
        style={{ borderColor: 'var(--color-border-light)' }}
      >
        <button
          onClick={() => setActiveNote(null)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-opacity hover:opacity-60"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={insertChecklist}
            title="Insertar ítem de lista"
            className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-70"
            style={{
              borderColor: 'var(--color-border-medium)',
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-bg)',
            }}
          >
            <CheckSquare size={13} />
            Lista
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            title={`Guardar (${shortcut})`}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-sidebar-accent)', color: '#fff' }}
          >
            <Save size={13} />
            {saving ? 'Guardando...' : `Guardar  ${shortcut}`}
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6 md:px-12 md:py-8 max-w-3xl w-full mx-auto">
        <input
          type="text"
          placeholder="Título de la nota"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full bg-transparent text-2xl font-bold outline-none placeholder:opacity-30"
          style={{ color: 'var(--color-text-primary)' }}
          autoFocus={!existingNote}
        />
        <textarea
          ref={contentRef}
          placeholder="Escribe aquí..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full resize-none bg-transparent font-mono text-sm leading-relaxed outline-none placeholder:opacity-30 placeholder:font-sans"
          style={{ color: 'var(--color-text-primary)', minHeight: '300px' }}
        />
      </div>
    </div>
  )
}
