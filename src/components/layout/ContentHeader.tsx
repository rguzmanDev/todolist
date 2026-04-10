'use client'

import { useState } from 'react'
import { Plus, ChevronRight } from 'lucide-react'
import TaskFilters from '@/components/tasks/TaskFilters'
import TaskForm from '@/components/tasks/TaskForm'
import Button from '@/components/ui/Button'
import { useAppStore, selectSelectedBook, selectSelectedSection } from '@/lib/store'

export default function ContentHeader() {
  const [showNewTask, setShowNewTask] = useState(false)

  const selectedBookId = useAppStore((s) => s.selectedBookId)
  const selectedBook = useAppStore(selectSelectedBook)
  const selectedSection = useAppStore(selectSelectedSection)

  const title = selectedSection?.name ?? selectedBook?.name ?? null

  if (!selectedBookId) return null

  return (
    <>
      <header className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg)' }}>
        <div>
          {selectedSection ? (
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{selectedBook?.name}</span>
              <ChevronRight size={14} style={{ color: 'var(--color-text-tertiary)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{selectedSection.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: selectedBook?.color }}
              />
              <h1 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <TaskFilters />
          <Button size="sm" onClick={() => setShowNewTask(true)}>
            <Plus size={16} />
            Nueva tarea
          </Button>
        </div>
      </header>

      {showNewTask && selectedBookId && (
        <TaskForm
          open={showNewTask}
          onClose={() => setShowNewTask(false)}
          bookId={selectedBookId}
          sectionId={selectedSection?.id ?? null}
        />
      )}
    </>
  )
}
