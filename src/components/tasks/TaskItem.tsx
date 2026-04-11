'use client'

import { useState } from 'react'
import { Edit, Trash2, Square, CheckSquare } from 'lucide-react'
import PriorityBadge from '@/components/ui/PriorityBadge'
import TaskForm from '@/components/tasks/TaskForm'
import { useAppStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import { formatDate, cn } from '@/lib/utils'
import type { Task } from '@/lib/types'

// Status visual config
const STATUS_CONFIG = {
  pending:     { label: 'Pendiente',  borderColor: 'var(--color-border-light)', badgeBg: 'var(--color-badge-bg)',  badgeText: 'var(--color-text-tertiary)' },
  in_progress: { label: 'En proceso', borderColor: '#f59e0b',                   badgeBg: '#fef3c7',                badgeText: '#92400e' },
  completed:   { label: 'Completado', borderColor: '#22c55e',                   badgeBg: '#dcfce7',                badgeText: '#166534' },
} as const

interface TaskItemProps {
  task: Task
  dragHandle?: React.HTMLAttributes<HTMLDivElement>
  selected?: boolean
  onToggleSelect?: () => void
}

export default function TaskItem({ task, dragHandle, selected = false, onToggleSelect }: TaskItemProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const deleteTask = useAppStore((s) => s.deleteTask)
  const selectedBookId = useAppStore((s) => s.selectedBookId)

  const handleDelete = () => {
    toast.confirm(
      `¿Eliminar "${task.title}"?`,
      async () => {
        setDeleting(true)
        await deleteTask(task.id)
      }
    )
  }

  const statusCfg = STATUS_CONFIG[task.status]
  const isCompleted = task.status === 'completed'

  return (
    <>
      <div
        className={cn(
          'group relative flex items-start gap-3 overflow-hidden rounded-xl border-l-[3px] border-r border-t border-b px-4 py-3 transition-shadow duration-200 hover:shadow-md',
          isCompleted && 'opacity-60'
        )}
        style={{
          backgroundColor: selected
            ? 'color-mix(in srgb, var(--color-sidebar-accent) 6%, var(--color-bg))'
            : 'var(--color-bg)',
          borderLeftColor: selected ? 'var(--color-sidebar-accent)' : statusCfg.borderColor,
          borderRightColor: 'var(--color-border-light)',
          borderTopColor: 'var(--color-border-light)',
          borderBottomColor: 'var(--color-border-light)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        }}
      >
        {/* Drag handle */}
        {dragHandle && (
          <div
            {...dragHandle}
            className="absolute left-0 top-0 h-full w-1.5 cursor-grab opacity-0 group-hover:opacity-100 active:cursor-grabbing transition-opacity touch-none"
            style={{ backgroundColor: selected ? 'var(--color-sidebar-accent)' : statusCfg.borderColor, touchAction: 'none' }}
          />
        )}

        {/* Selection checkbox */}
        {onToggleSelect && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect() }}
            aria-label={selected ? 'Deseleccionar' : 'Seleccionar'}
            className={`flex shrink-0 items-center self-center rounded transition-opacity ${
              selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
            }`}
            style={{ color: selected ? 'var(--color-sidebar-accent)' : 'var(--color-text-tertiary)' }}
          >
            {selected ? <CheckSquare size={20} /> : <Square size={20} />}
          </button>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p
            className={cn('text-sm font-medium leading-snug', isCompleted && 'line-through')}
            style={{ color: isCompleted ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)' }}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="mt-0.5 text-xs line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
              {task.description}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            {/* Status badge */}
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: statusCfg.badgeBg, color: statusCfg.badgeText }}
            >
              {statusCfg.label}
            </span>
            <PriorityBadge priority={task.priority} />
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {formatDate(task.createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-0.5 transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100">
          <button
            onClick={() => setShowEdit(true)}
            aria-label="Editar tarea"
            className="rounded-md p-1.5 transition-opacity hover:opacity-60"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Edit size={14} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Eliminar tarea"
            className="rounded-md p-1.5 transition-opacity hover:opacity-60"
            style={{ color: '#ef4444' }}
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
