'use client'

import { useState } from 'react'
import PriorityBadge from '@/components/ui/PriorityBadge'
import TaskForm from '@/components/tasks/TaskForm'
import { useAppStore } from '@/lib/store'
import { formatDate, cn } from '@/lib/utils'
import type { Task } from '@/lib/types'

interface TaskItemProps {
  task: Task
}

export default function TaskItem({ task }: TaskItemProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const updateTask = useAppStore((s) => s.updateTask)
  const deleteTask = useAppStore((s) => s.deleteTask)
  const selectedBookId = useAppStore((s) => s.selectedBookId)

  const handleToggle = async () => {
    setToggling(true)
    await updateTask(task.id, {
      status: task.status === 'pending' ? 'completed' : 'pending',
    })
    setToggling(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await deleteTask(task.id)
  }

  const isCompleted = task.status === 'completed'

  return (
    <>
      <div
        className={cn(
          'group flex items-start gap-3 rounded-lg border border-transparent px-4 py-3',
          'hover:border-gray-100 hover:bg-gray-50 transition-colors',
          isCompleted && 'opacity-60'
        )}
      >
        <button
          onClick={handleToggle}
          disabled={toggling}
          aria-label={isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}
          className={cn(
            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded',
            'border-2 transition-colors',
            isCompleted
              ? 'border-indigo-500 bg-indigo-500 text-white'
              : 'border-gray-300 hover:border-indigo-400'
          )}
        >
          {isCompleted && (
            <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1.5 5.5L4 8L8.5 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-sm font-medium text-gray-800 leading-snug',
              isCompleted && 'line-through text-gray-400'
            )}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{task.description}</p>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <span className="text-xs text-gray-400">{formatDate(task.createdAt)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowEdit(true)}
            aria-label="Editar tarea"
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Eliminar tarea"
            className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.559a.75.75 0 1 0-1.492.149l.66 6.6A1.75 1.75 0 0 0 5.405 15h5.19a1.75 1.75 0 0 0 1.74-1.692l.661-6.6a.75.75 0 0 0-1.492-.149l-.66 6.6a.25.25 0 0 1-.249.241h-5.19a.25.25 0 0 1-.249-.241ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
            </svg>
          </button>
        </div>
      </div>

      {showEdit && selectedBookId && (
        <TaskForm
          open={showEdit}
          onClose={() => setShowEdit(false)}
          bookId={task.bookId}
          sectionId={task.sectionId}
          task={task}
        />
      )}
    </>
  )
}
