'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { Plus, FileText } from 'lucide-react'
import { useAppStore, selectSelectedBook } from '@/lib/store'
import TaskGroup from '@/components/tasks/TaskGroup'
import NoteItem from '@/components/notes/NoteItem'
import type { Task } from '@/lib/types'
import EmptyState from '@/components/ui/EmptyState'
import { useTheme } from '@/lib/hooks/useTheme'

function SectionDivider({ name, count }: { name: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 mt-2">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>{name}</span>
      {count > 0 && (
        <span className="rounded-full px-1.5 py-0.5 text-xs" style={{ backgroundColor: 'var(--color-badge-bg)', color: 'var(--color-badge-text)' }}>{count}</span>
      )}
      <div className="flex-1 border-t" style={{ borderColor: 'var(--color-border-light)' }} />
    </div>
  )
}

function WelcomeIcon() {
  const { theme } = useTheme()
  return (
    <Image
      src={theme === 'dark' ? '/logotipoOscuro.png' : '/logotipoClaro.png'}
      alt="Folio"
      width={320}
      height={110}
      className="object-contain opacity-90"
    />
  )
}

export default function BookView() {
  const sections = useAppStore((s) => s.sections)
  const tasks = useAppStore((s) => s.tasks)
  const notes = useAppStore((s) => s.notes)
  const taskFilter = useAppStore((s) => s.taskFilter)
  const isLoadingTasks = useAppStore((s) => s.isLoadingTasks)
  const selectedBookId = useAppStore((s) => s.selectedBookId)
  const setActiveNote = useAppStore((s) => s.setActiveNote)
  const selectedBook = useAppStore(selectSelectedBook)
  const isNotesBook = selectedBook?.type === 'notes'

  const filteredTasks = useMemo(
    () => (taskFilter === 'all' ? tasks : tasks.filter((t) => t.status === taskFilter)),
    [tasks, taskFilter]
  )

  const tasksBySection = useMemo(() => {
    const map = new Map<string | null, Task[]>()
    for (const task of filteredTasks) {
      const group = map.get(task.sectionId) ?? []
      group.push(task)
      map.set(task.sectionId, group)
    }
    return map
  }, [filteredTasks])

  if (!selectedBookId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          icon={<WelcomeIcon />}
          title="Selecciona un libro para comenzar"
          description="Elige un libro de la barra lateral o crea uno nuevo"
        />
      </div>
    )
  }

  if (isLoadingTasks) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Cargando...</p>
      </div>
    )
  }

  // Notes book
  if (isNotesBook) {
    const directNotes = notes.filter((n) => n.sectionId === null)
    if (notes.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<FileText className="h-10 w-10" strokeWidth={1.5} />}
            title="Sin notas"
            description="Crea tu primera nota"
            action={
              <button
                onClick={() => setActiveNote('new')}
                className="mt-1 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--color-button-primary-bg)', color: 'var(--color-button-primary-text)' }}
              >
                <Plus size={15} />
                Nueva nota
              </button>
            }
          />
        </div>
      )
    }
    return (
      <div className="flex-1 overflow-y-auto py-2">
        {directNotes.length > 0 && (
          <div>
            {sections.length > 0 && <SectionDivider name="General" count={directNotes.length} />}
            <div className="flex flex-col gap-2 px-4 py-3">
              {directNotes.map((note) => <NoteItem key={note.id} note={note} />)}
            </div>
          </div>
        )}
        {sections.map((section) => {
          const sectionNotes = notes.filter((n) => n.sectionId === section.id)
          if (sectionNotes.length === 0) return null
          return (
            <div key={section.id}>
              <SectionDivider name={section.name} count={sectionNotes.length} />
              <div className="flex flex-col gap-2 px-4 py-3">
                {sectionNotes.map((note) => <NoteItem key={note.id} note={note} />)}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Tasks book
  const directTasks = tasksBySection.get(null) ?? []
  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          icon={<WelcomeIcon />}
          title="Sin tareas"
          description="Usa el boton Nueva tarea para agregar tu primer tarea"
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto py-2">
      {directTasks.length > 0 && (
        <div>
          {sections.length > 0 && <SectionDivider name="Tareas directas" count={directTasks.length} />}
          <TaskGroup tasks={directTasks} />
        </div>
      )}
      {sections.map((section) => {
        const sectionTasks = tasksBySection.get(section.id) ?? []
        if (sectionTasks.length === 0) return null
        return (
          <div key={section.id}>
            <SectionDivider name={section.name} count={sectionTasks.length} />
            <TaskGroup tasks={sectionTasks} />
          </div>
        )
      })}
    </div>
  )
}
