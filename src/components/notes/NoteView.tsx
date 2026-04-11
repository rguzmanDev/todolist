'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, CheckSquare, Cloud, CloudOff, Loader2, Check } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import type { Note } from '@/lib/types'

// ─── uid ─────────────────────────────────────────────────────────────────────
let _uid = 0
const uid = () => `b${++_uid}`

// ─── Block model ─────────────────────────────────────────────────────────────
type BType = 'text' | 'checklist'
interface Block { id: string; type: BType; text: string; checked: boolean }

function parseBlocks(raw: string): Block[] {
  const lines = raw ? raw.split('\n') : ['']
  return lines.map(line => {
    if (line.startsWith('- [x] ')) return { id: uid(), type: 'checklist' as BType, checked: true,  text: line.slice(6) }
    if (line.startsWith('- [ ] ')) return { id: uid(), type: 'checklist' as BType, checked: false, text: line.slice(6) }
    if (line === '- [x]')          return { id: uid(), type: 'checklist' as BType, checked: true,  text: '' }
    if (line === '- [ ]')          return { id: uid(), type: 'checklist' as BType, checked: false, text: '' }
    return { id: uid(), type: 'text' as BType, checked: false, text: line }
  })
}

function serialize(blocks: Block[]): string {
  return blocks.map(b =>
    b.type === 'checklist' ? `- [${b.checked ? 'x' : ' '}] ${b.text}` : b.text
  ).join('\n')
}

// ─── useIsMac ────────────────────────────────────────────────────────────────
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

// ─── BlockLine ────────────────────────────────────────────────────────────────
function BlockLine({
  block, showPlaceholder, registerRef, onChange, onToggle,
  onEnter, onBackspaceAtStart, onArrowUp, onArrowDown, onFocus, onSave,
}: {
  block: Block
  showPlaceholder: boolean
  registerRef: (el: HTMLTextAreaElement | null) => void
  onChange: (text: string) => void
  onToggle: () => void
  onEnter: (pos: number) => void
  onBackspaceAtStart: () => void
  onArrowUp: () => void
  onArrowDown: () => void
  onFocus: () => void
  onSave: () => void
}) {
  const taRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const ta = taRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = `${ta.scrollHeight}px` }
  }, [block.text])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta  = taRef.current!
    const pos = ta.selectionStart
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter')           { e.preventDefault(); onSave(); return }
    if (e.key === 'Enter'    && !e.shiftKey)                      { e.preventDefault(); onEnter(pos); return }
    if (e.key === 'Backspace' && pos === 0 && ta.selectionEnd === 0) { e.preventDefault(); onBackspaceAtStart(); return }
    if (e.key === 'ArrowUp'   && pos === 0)                       { e.preventDefault(); onArrowUp(); return }
    if (e.key === 'ArrowDown' && pos === ta.value.length)         { e.preventDefault(); onArrowDown(); return }
  }

  return (
    <div className="flex items-start gap-2 py-[1px]">
      {block.type === 'checklist' && (
        <button
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onToggle}
          className="mt-[3px] shrink-0 flex items-center justify-center rounded transition-colors"
          style={{
            width: 15, height: 15,
            border: block.checked
              ? '2px solid var(--color-sidebar-accent)'
              : '2px solid var(--color-border-medium)',
            backgroundColor: block.checked ? 'var(--color-sidebar-accent)' : 'transparent',
          }}
        >
          {block.checked && <Check size={9} strokeWidth={3.5} color="#fff" />}
        </button>
      )}
      <textarea
        ref={el => { taRef.current = el; registerRef(el) }}
        value={block.text}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        rows={1}
        placeholder={showPlaceholder ? 'Escribe aquí...' : undefined}
        className="flex-1 resize-none bg-transparent font-mono text-sm leading-relaxed outline-none overflow-hidden placeholder:opacity-30 placeholder:font-sans"
        style={{
          color: 'var(--color-text-primary)',
          textDecoration: block.checked ? 'line-through' : 'none',
          opacity: block.checked ? 0.45 : 1,
          padding: 0,
        }}
      />
    </div>
  )
}

// ─── NoteView ─────────────────────────────────────────────────────────────────
export default function NoteView() {
  const activeNote        = useAppStore((s) => s.activeNote)
  const setActiveNote     = useAppStore((s) => s.setActiveNote)
  const selectedBookId    = useAppStore((s) => s.selectedBookId)
  const selectedSectionId = useAppStore((s) => s.selectedSectionId)
  const createNote        = useAppStore((s) => s.createNote)
  const updateNote        = useAppStore((s) => s.updateNote)

  const existingNote = activeNote !== 'new' && activeNote !== null ? (activeNote as Note) : null
  const noteIdRef    = useRef<string | null>(existingNote?.id ?? null)
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lineRefs     = useRef<Map<string, HTMLTextAreaElement>>(new Map())
  const focusedId    = useRef<string | null>(null)
  const titleRef     = useRef<string>(existingNote?.title ?? '')
  const blocksRef    = useRef<Block[]>(parseBlocks(existingNote?.content ?? ''))

  const isMac    = useIsMac()
  const shortcut = isMac ? '⌘↵' : 'Ctrl+↵'

  const [title,      setTitle]      = useState(existingNote?.title   ?? '')
  const [blocks,     setBlocksState] = useState<Block[]>(blocksRef.current)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  // ── Save ──────────────────────────────────────────────────────────────────
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

  const scheduleSave = useCallback((t: string, c: string) => {
    setSaveStatus('pending')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSave(t, c), 1500)
  }, [doSave])

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  const handleManualSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    doSave(titleRef.current, serialize(blocksRef.current), true)
  }, [doSave])

  // ── Apply block mutations ─────────────────────────────────────────────────
  const applyBlocks = useCallback((updater: (prev: Block[]) => Block[]) => {
    const next = updater(blocksRef.current)
    blocksRef.current = next
    setBlocksState(next)
    scheduleSave(titleRef.current, serialize(next))
  }, [scheduleSave])

  // ── Focus util ────────────────────────────────────────────────────────────
  const focusBlock = useCallback((id: string, pos?: number) => {
    const el = lineRefs.current.get(id)
    if (!el) return
    el.focus()
    const p = pos !== undefined ? Math.min(pos, el.value.length) : el.value.length
    el.setSelectionRange(p, p)
  }, [])

  // ── Block operations ──────────────────────────────────────────────────────
  const updateText = useCallback((id: string, text: string) => {
    applyBlocks(prev => prev.map(b => b.id === id ? { ...b, text } : b))
  }, [applyBlocks])

  const toggleBlock = useCallback((id: string) => {
    applyBlocks(prev => prev.map(b => b.id === id ? { ...b, checked: !b.checked } : b))
  }, [applyBlocks])

  const insertAfter = useCallback((id: string, cursorPos: number) => {
    applyBlocks(prev => {
      const idx   = prev.findIndex(b => b.id === id)
      const block = prev[idx]
      const before = block.text.slice(0, cursorPos)
      const after  = block.text.slice(cursorPos)

      if (block.type === 'checklist' && !block.text.trim()) {
        // Empty checklist line → exit checklist
        const updated = { ...block, type: 'text' as BType }
        setTimeout(() => focusBlock(updated.id, 0), 0)
        return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)]
      }

      const newBlock: Block = { id: uid(), type: block.type, checked: false, text: after }
      setTimeout(() => focusBlock(newBlock.id, 0), 0)
      return [...prev.slice(0, idx), { ...block, text: before }, newBlock, ...prev.slice(idx + 1)]
    })
  }, [applyBlocks, focusBlock])

  const mergeWithPrevious = useCallback((id: string) => {
    applyBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id)
      if (idx === 0) return prev
      const prevB = prev[idx - 1]
      const pivot = prevB.text.length
      const merged = { ...prevB, text: prevB.text + prev[idx].text }
      setTimeout(() => focusBlock(prevB.id, pivot), 0)
      return [...prev.slice(0, idx - 1), merged, ...prev.slice(idx + 1)]
    })
  }, [applyBlocks, focusBlock])

  const arrowUp = useCallback((id: string) => {
    const prev = blocksRef.current
    const idx  = prev.findIndex(b => b.id === id)
    if (idx > 0) setTimeout(() => focusBlock(prev[idx - 1].id), 0)
  }, [focusBlock])

  const arrowDown = useCallback((id: string) => {
    const prev = blocksRef.current
    const idx  = prev.findIndex(b => b.id === id)
    if (idx < prev.length - 1) setTimeout(() => focusBlock(prev[idx + 1].id), 0)
  }, [focusBlock])

  // ── Insert/toggle checklist ───────────────────────────────────────────────
  const insertChecklist = () => {
    const fid = focusedId.current
    applyBlocks(prev => {
      if (fid) {
        const next = prev.map(b =>
          b.id === fid ? { ...b, type: (b.type === 'checklist' ? 'text' : 'checklist') as BType } : b
        )
        setTimeout(() => focusBlock(fid), 0)
        return next
      }
      const newBlock: Block = { id: uid(), type: 'checklist', checked: false, text: '' }
      setTimeout(() => focusBlock(newBlock.id, 0), 0)
      return [...prev, newBlock]
    })
  }

  // ── Save indicator ────────────────────────────────────────────────────────
  const SaveIndicator = () => {
    if (saveStatus === 'idle')    return null
    if (saveStatus === 'pending') return <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}><Loader2 size={12} className="animate-spin" />Escribiendo…</span>
    if (saveStatus === 'saving')  return <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}><Loader2 size={12} className="animate-spin" />Guardando…</span>
    if (saveStatus === 'saved')   return <span className="flex items-center gap-1 text-xs" style={{ color: '#22c55e' }}><Cloud size={12} />Guardado</span>
    if (saveStatus === 'error')   return <span className="flex items-center gap-1 text-xs" style={{ color: '#ef4444' }}><CloudOff size={12} />Error al guardar</span>
    return null
  }

  // ── Render ────────────────────────────────────────────────────────────────
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

        <div className="flex items-center gap-2">
          <SaveIndicator />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={insertChecklist}
            title="Convertir línea en ítem de lista"
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
            onMouseDown={(e) => e.preventDefault()}
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
          onChange={(e) => {
            const val = e.target.value
            titleRef.current = val
            setTitle(val)
            scheduleSave(val, serialize(blocksRef.current))
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleManualSave() }
          }}
          className="mb-6 w-full bg-transparent text-2xl font-bold outline-none placeholder:opacity-30"
          style={{ color: 'var(--color-text-primary)' }}
          autoFocus={!existingNote}
        />

        <div className="flex flex-col">
          {blocks.map((block, i) => (
            <BlockLine
              key={block.id}
              block={block}
              showPlaceholder={blocks.length === 1 && i === 0 && block.type === 'text'}
              registerRef={(el) => {
                if (el) lineRefs.current.set(block.id, el)
                else lineRefs.current.delete(block.id)
              }}
              onChange={(text) => updateText(block.id, text)}
              onToggle={() => toggleBlock(block.id)}
              onEnter={(pos) => insertAfter(block.id, pos)}
              onBackspaceAtStart={() => mergeWithPrevious(block.id)}
              onArrowUp={() => arrowUp(block.id)}
              onArrowDown={() => arrowDown(block.id)}
              onFocus={() => { focusedId.current = block.id }}
              onSave={handleManualSave}
            />
          ))}
          {/* Clickable empty area below content */}
          <div
            className="min-h-16 cursor-text"
            onClick={() => {
              const last = blocksRef.current[blocksRef.current.length - 1]
              if (last) focusBlock(last.id)
            }}
          />
        </div>
      </div>
    </div>
  )
}
