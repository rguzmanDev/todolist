'use client'

import { useMemo, useState } from 'react'
import { Plus, FileText } from 'lucide-react'
import { useAppStore, selectSelectedBook } from '@/lib/store'
import TaskGroup from '@/components/tasks/TaskGroup'
import NoteItem from '@/components/notes/NoteItem'
import EmptyState from '@/components/ui/EmptyState'
import TaskForm from '@/components/tasks/TaskForm'

function TaskIcon() {
  return (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  )
}

export default function SectionView() {
  const tasks = useAppStore((s) => s.tasks)
  const notes = useAppStore((s) => s.notes)
  const taskFilter = useAppStore((s) => s.taskFilter)
  const isLoadingTasks = useAppStore((s) => s.isLoadingTasks)
  const selectedBookId = useAppStore((s) => s.selectedBookId)
  const selectedSectionId = useAppStore((s) => s.selectedSectionId)
  const setActiveNote = useAppStore((s) => s.setActiveNote)
  const selectedBook = useAppStore(selectSelectedBook)
  const [showNew, setShowNew] = useState(false)

  const filteredTasks = useMemo(
    () => (taskFilter === 'all' ? tasks : tasks.filter((t) => t.status === taskFilter)),
    [tasks, taskFilter]
  )

  if (isLoadingTasks) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Cargando...</p>
      </div>
    )
  }

  // Notes book
  if (selectedBook?.type === 'notes') {
    if (notes.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<FileText className="h-10 w-10" strokeWidth={1.5} />}
            title="Sin notas en esta seccion"
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
        <div className="flex flex-col gap-2 px-4 py-3">
          {notes.map((note) => <NoteItem key={note.id} note={note} />)}
        </div>
      </div>
    )
  }

  // Tasks book
  if (filteredTasks.length === 0) {
    return (
      <>
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<TaskIcon />}
            title={taskFilter === 'all' ? 'Sin tareas en esta seccion' : `Sin tareas ${taskFilter === 'completed' ? 'completadas' : 'pendientes'}`}
            description={taskFilter === 'all' ? 'Crea tu primera tarea' : undefined}
            action={taskFilter === 'all' && selectedBookId ? (
              <button
                onClick={() => setShowNew(true)}
                className="mt-1 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--color-button-primary-bg)', color: 'var(--color-button-primary-text)' }}
              >
                <Plus size={15} />
                Nueva tarea
              </button>
            ) : undefined}
          />
        </div>
        {showNew && selectedBookId && (
          <TaskForm
            open={showNew}
            onClose={() => setShowNew(false)}
            bookId={selectedBookId}
            sectionId={selectedSectionId}
          />
        )}
      </>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto py-2">
      <TaskGroup tasks={filteredTasks} />
    </div>
  )
}
