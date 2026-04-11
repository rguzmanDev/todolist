'use client'

import { FileText, Edit, Trash2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import { formatDate, cn } from '@/lib/utils'
import type { Note } from '@/lib/types'

function parsePreviewLines(content: string) {
  return content.split('\n').slice(0, 5).map((line) => {
    if (line.startsWith('- [x] ')) return { type: 'check' as const, text: line.slice(6), checked: true }
    if (line.startsWith('- [ ] ')) return { type: 'check' as const, text: line.slice(6), checked: false }
    return { type: 'text' as const, text: line, checked: false }
  }).filter((l) => l.text.trim())
}

export default function NoteItem({ note }: { note: Note }) {
  const deleteNote = useAppStore((s) => s.deleteNote)
  const updateNote = useAppStore((s) => s.updateNote)
  const setActiveNote = useAppStore((s) => s.setActiveNote)

  const handleDelete = () => {
    toast.confirm(
      `¿Eliminar "${note.title || 'esta nota'}"?`,
      () => deleteNote(note.id)
    )
  }

  const toggleCheckItem = (lineIndex: number, checked: boolean) => {
    const lines = note.content.split('\n')
    if (checked) {
      lines[lineIndex] = lines[lineIndex].replace(/^- \[x\] /, '- [ ] ')
    } else {
      lines[lineIndex] = lines[lineIndex].replace(/^- \[ \] /, '- [x] ')
    }
    updateNote(note.id, { content: lines.join('\n') })
  }

  const previewLines = parsePreviewLines(note.content)
  const allContentLines = note.content.split('\n')

  return (
    <>
      <div
        className="group relative flex flex-col gap-2 overflow-hidden rounded-xl border px-4 py-3 transition-shadow duration-200 hover:shadow-md cursor-pointer"
        style={{
          backgroundColor: 'var(--color-bg)',
          borderColor: 'var(--color-border-light)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        }}
        onClick={() => setActiveNote(note)}
      >
        {/* Icon tag */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={13} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
            {note.title ? (
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                {note.title}
              </p>
            ) : (
              <p className="text-sm italic line-clamp-1" style={{ color: 'var(--color-text-tertiary)' }}>
                Sin título
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-0.5 transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100">
            <button onClick={(e) => { e.stopPropagation(); setActiveNote(note) }} aria-label="Editar nota"
              className="rounded-md p-1.5 transition-opacity hover:opacity-60"
              style={{ color: 'var(--color-text-secondary)' }}>
              <Edit size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDelete() }} aria-label="Eliminar nota"
              className="rounded-md p-1.5 transition-opacity hover:opacity-60"
              style={{ color: '#ef4444' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Content preview */}
        {previewLines.length > 0 && (
          <div className="flex flex-col gap-1">
            {previewLines.map((line, idx) => {
              const lineIndex = allContentLines.findIndex((l) => {
                if (line.type === 'check') {
                  const prefix = line.checked ? `- [x] ${line.text}` : `- [ ] ${line.text}`
                  return l === prefix
                }
                return l === line.text
              })
              return line.type === 'check' ? (
                <button
                  key={idx}
                  onClick={() => toggleCheckItem(lineIndex >= 0 ? lineIndex : idx, line.checked)}
                  className="flex items-center gap-2 text-left"
                >
                  <span
                    className={cn(
                      'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                    )}
                    style={line.checked
                      ? { borderColor: 'var(--color-sidebar-accent)', backgroundColor: 'var(--color-sidebar-accent)' }
                      : { borderColor: 'var(--color-border-medium)' }
                    }
                  >
                    {line.checked && (
                      <svg viewBox="0 0 10 10" className="h-2 w-2 fill-none stroke-white" strokeWidth={2.5}>
                        <path d="M1.5 5L4 7.5L8.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className={cn('text-xs', line.checked && 'line-through opacity-50')}
                    style={{ color: 'var(--color-text-secondary)' }}>
                    {line.text}
                  </span>
                </button>
              ) : (
                <p key={idx} className="text-xs line-clamp-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {line.text}
                </p>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {formatDate(note.updatedAt)}
          </span>
          {note.content.split('\n').filter(l => l.startsWith('- [')).length > 0 && (
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {note.content.split('\n').filter(l => l.startsWith('- [x]')).length}/
              {note.content.split('\n').filter(l => l.startsWith('- [')).length} completados
            </span>
          )}
        </div>
      </div>
    </>
  )
}
