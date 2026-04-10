'use client'

import { useState } from 'react'
import { Check, Edit, Trash2 } from 'lucide-react'
import PriorityBadge from '@/components/ui/PriorityBadge'
import TaskForm from '@/components/tasks/TaskForm'
import { useAppStore } from '@/lib/store'
import { formatDate, cn } from '@/lib/utils'
import { THEME } from '@/lib/theme'
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
          'transition-all duration-200',
          'hover:border-violet-200 hover:bg-violet-50 hover:shadow-sm',
          isCompleted && 'opacity-60'
        )}
      >
        <button
          onClick={handleToggle}
          disabled={toggling}
          aria-label={isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}
          className={cn(
            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded',
            'border-2 transition-all duration-200',
            isCompleted
              ? 'border-violet-500 bg-violet-500 text-white'
              : 'border-slate-300 hover:border-violet-400'
          )}
        >
          {isCompleted && (
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
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

        <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={() => setShowEdit(true)}
            aria-label="Editar tarea"
            className="rounded-md p-1.5 transition-all duration-200 hover:scale-110"
            style={{ color: THEME.ui.text.secondary, backgroundColor: THEME.ui.state.hover }}
          >
            <Edit size={14} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Eliminar tarea"
            className="rounded-md p-1.5 transition-all duration-200 hover:scale-110"
            style={{ color: THEME.ui.button.danger.text, backgroundColor: THEME.ui.button.danger.bg }}
          >
            <Trash2 size={14} />
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
