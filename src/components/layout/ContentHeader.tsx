'use client'

import { useState } from 'react'
import TaskFilters from '@/components/tasks/TaskFilters'
import TaskForm from '@/components/tasks/TaskForm'
import Button from '@/components/ui/Button'
import { useAppStore, selectSelectedBook, selectSelectedSection } from '@/lib/store'

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
    </svg>
  )
}

export default function ContentHeader() {
  const [showNewTask, setShowNewTask] = useState(false)

  const selectedBookId = useAppStore((s) => s.selectedBookId)
  const selectedBook = useAppStore(selectSelectedBook)
  const selectedSection = useAppStore(selectSelectedSection)

  const title = selectedSection?.name ?? selectedBook?.name ?? null

  if (!selectedBookId) return null

  return (
    <>
      <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          {selectedSection ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{selectedBook?.name}</span>
              <svg className="h-3.5 w-3.5 text-gray-300" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">{selectedSection.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: selectedBook?.color }}
              />
              <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <TaskFilters />
          <Button size="sm" onClick={() => setShowNewTask(true)}>
            <PlusIcon />
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
