'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, CheckSquare, Cloud, CloudOff, Loader2 } from 'lucide-react'
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

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  // Track the id of the note (needed after first save of a new note)
  const noteIdRef = useRef<string | null>(existingNote?.id ?? null)

  const contentRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMac = useIsMac()
  const shortcut = isMac ? '⌘↵' : 'Ctrl+↵'

  // Auto-resize textarea
  useEffect(() => {
    const ta = contentRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${ta.scrollHeight}px`
    }
  }, [content])

  const doSave = useCallback(async (t: string, c: string, showToast = false) => {
    if (!t.trim() && !c.trim()) return
    setSaveStatus('saving')
    try {
      if (noteIdRef.current) {
        await updateNote(noteIdRef.current, { title: t.trim(), content: c })
      } else if (selectedBookId) {
        const created = await createNote({
          bookId: selectedBookId,
          sectionId: selectedSectionId ?? null,
          title: t.trim(),
          content: c,
        })
        noteIdRef.current = created.id
      }
      setSaveStatus('saved')
      if (showToast) toast.success('Nota guardada')
    } catch {
      setSaveStatus('error')
      if (showToast) toast.error('Error al guardar')
    }
  }, [selectedBookId, selectedSectionId, createNote, updateNote])

  // Debounced auto-save: 1.5 s after last keystroke
  const scheduleAutoSave = useCallback((t: string, c: string) => {
    setSaveStatus('pending')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      doSave(t, c)
    }, 1500)
  }, [doSave])

  // Cleanup debounce on unmount
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  const handleTitleChange = (val: string) => {
    setTitle(val)
    scheduleAutoSave(val, content)
  }

  const handleContentChange = (val: string) => {
    setContent(val)
    scheduleAutoSave(title, val)
  }

  // Manual save (Ctrl/Cmd+Enter) — flushes debounce immediately
  const handleManualSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    doSave(title, content, true)
  }, [title, content, doSave])

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
    handleContentChange(newContent)
    const newPos = (needsNewLine ? pos : lineStart) + insertion.length + (needsNewLine ? 0 : lineContent.length)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleManualSave()
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
        handleContentChange(newContent)
        setTimeout(() => ta.setSelectionRange(lineStart, lineStart), 0)
      } else if (currentLine.startsWith('- [ ] ') || currentLine.startsWith('- [x] ')) {
        e.preventDefault()
        const newContent = content.slice(0, pos) + '\n- [ ] ' + content.slice(pos)
        handleContentChange(newContent)
        setTimeout(() => ta.setSelectionRange(pos + 7, pos + 7), 0)
      }
    }
  }

  // Save status indicator
  const SaveIndicator = () => {
    if (saveStatus === 'idle') return null
    if (saveStatus === 'pending')
      return <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}><Loader2 size={12} className="animate-spin" />Escribiendo…</span>
    if (saveStatus === 'saving')
      return <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}><Loader2 size={12} className="animate-spin" />Guardando…</span>
    if (saveStatus === 'saved')
      return <span className="flex items-center gap-1 text-xs" style={{ color: '#22c55e' }}><Cloud size={12} />Guardado</span>
    if (saveStatus === 'error')
      return <span className="flex items-center gap-1 text-xs" style={{ color: '#ef4444' }}><CloudOff size={12} />Error al guardar</span>
    return null
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Toolbar */}
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

        <div className="flex items-center gap-3">
          <SaveIndicator />
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
            onClick={handleManualSave}
            disabled={saveStatus === 'saving'}
            title={`Guardar ahora (${shortcut})`}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-sidebar-accent)', color: '#fff' }}
          >
            {saveStatus === 'saving' ? <Loader2 size={13} className="animate-spin" /> : <Cloud size={13} />}
            {saveStatus === 'saving' ? 'Guardando…' : shortcut}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6 md:px-12 md:py-8 max-w-3xl w-full mx-auto">
        <input
          type="text"
          placeholder="Título de la nota"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="mb-4 w-full bg-transparent text-2xl font-bold outline-none placeholder:opacity-30"
          style={{ color: 'var(--color-text-primary)' }}
          autoFocus={!existingNote}
        />
        <textarea
          ref={contentRef}
          placeholder="Escribe aquí..."
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full resize-none bg-transparent font-mono text-sm leading-relaxed outline-none placeholder:opacity-30 placeholder:font-sans"
          style={{ color: 'var(--color-text-primary)', minHeight: '300px' }}
        />
      </div>
    </div>
  )
}
