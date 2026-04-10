'use client'

import { useState } from 'react'
import { Plus, ChevronRight } from 'lucide-react'
import TaskFilters from '@/components/tasks/TaskFilters'
import TaskForm from '@/components/tasks/TaskForm'
import Button from '@/components/ui/Button'
import { MobileSidebarTrigger } from '@/components/layout/MobileSidebar'
import { useAppStore, selectSelectedBook, selectSelectedSection } from '@/lib/store'

export default function ContentHeader({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [showNewTask, setShowNewTask] = useState(false)

  const selectedBookId = useAppStore((s) => s.selectedBookId)
  const selectedBook = useAppStore(selectSelectedBook)
  const selectedSection = useAppStore(selectSelectedSection)

  const title = selectedSection?.name ?? selectedBook?.name ?? null

  if (!selectedBookId) return (
    <header className="flex items-center border-b px-3 py-3 md:hidden" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg)' }}>
      <MobileSidebarTrigger onClick={() => onMenuOpen?.()} />
    </header>
  )

  return (
    <>
      <header className="flex items-center justify-between border-b px-3 py-3 sm:px-4 sm:py-4" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg)' }}>
        <div className="flex items-center gap-3">
          <MobileSidebarTrigger onClick={() => onMenuOpen?.()} />
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
        </div>

        <div className="flex items-center gap-3">
          <TaskFilters />
          <Button size="sm" onClick={() => setShowNewTask(true)} title="Nueva tarea">
            <Plus size={16} />
            <span className="hidden sm:inline">Nueva tarea</span>
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
