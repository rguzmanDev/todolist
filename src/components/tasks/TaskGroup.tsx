'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, X } from 'lucide-react'
import TaskItem from '@/components/tasks/TaskItem'
import { useAppStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import type { Task, TaskStatus } from '@/lib/types'

interface SortableTaskProps {
  task: Task
  selected: boolean
  onToggleSelect: () => void
}

function SortableTask({ task, selected, onToggleSelect }: SortableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : undefined,
        position: 'relative',
      }}
    >
      <TaskItem
        task={task}
        dragHandle={{ ...attributes, ...listeners }}
        selected={selected}
        onToggleSelect={onToggleSelect}
      />
    </div>
  )
}

const STATUS_ACTIONS: { label: string; status: TaskStatus }[] = [
  { label: 'Pendiente', status: 'pending' },
  { label: 'En proceso', status: 'in_progress' },
  { label: 'Completado', status: 'completed' },
]

export default function TaskGroup({ tasks }: { tasks: Task[] }) {
  const [orderedIds, setOrderedIds] = useState<string[]>(() => tasks.map((t) => t.id))
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const bulkUpdateTasks = useAppStore((s) => s.bulkUpdateTasks)
  const bulkDeleteTasks = useAppStore((s) => s.bulkDeleteTasks)
  const reorderTasks = useAppStore((s) => s.reorderTasks)

  const taskIdsKey = tasks.map((t) => t.id).join(',')
  useEffect(() => {
    setOrderedIds(tasks.map((t) => t.id))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskIdsKey])

  const taskMap = new Map(tasks.map((t) => [t.id, t]))
  const validIds = orderedIds.filter((id) => taskMap.has(id))
  const newIds = tasks.map((t) => t.id).filter((id) => !orderedIds.includes(id))
  const finalIds = [...validIds, ...newIds]

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setOrderedIds((ids) => {
        const from = ids.indexOf(active.id as string)
        const to = ids.indexOf(over.id as string)
        const next = arrayMove(ids, from, to)
        reorderTasks(next)
        return next
      })
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  async function handleBulkStatus(status: TaskStatus) {
    await bulkUpdateTasks([...selectedIds], { status })
    clearSelection()
  }

  function handleBulkDelete() {
    const ids = [...selectedIds]
    toast.confirm(
      `¿Eliminar ${ids.length} tarea${ids.length !== 1 ? 's' : ''}?`,
      async () => {
        await bulkDeleteTasks(ids)
        clearSelection()
      }
    )
  }

  const hasSelection = selectedIds.size > 0

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={finalIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 px-4 py-3">
            {finalIds.map((id) => {
              const task = taskMap.get(id)
              return task ? (
                <SortableTask
                  key={id}
                  task={task}
                  selected={selectedIds.has(id)}
                  onToggleSelect={() => toggleSelect(id)}
                />
              ) : null
            })}
          </div>
        </SortableContext>
      </DndContext>

      {hasSelection && (
        <div
          className="sticky bottom-4 mx-4 mb-2 flex items-center gap-3 rounded-2xl border px-4 py-2.5 shadow-lg"
          style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border-medium)' }}
        >
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: 'var(--color-badge-bg)', color: 'var(--color-badge-text)' }}
          >
            {selectedIds.size}
          </span>
          <div className="flex flex-1 flex-wrap gap-1.5">
            {STATUS_ACTIONS.map(({ label, status }) => (
              <button
                key={status}
                onClick={() => handleBulkStatus(status)}
                className="rounded-lg border px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-70"
                style={{ borderColor: 'var(--color-sidebar-accent)', color: 'var(--color-sidebar-accent)' }}
              >
                {label}
              </button>
            ))}
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ backgroundColor: '#ef4444', color: '#fff' }}
            >
              <Trash2 size={11} />
              Eliminar
            </button>
          </div>
          <button
            onClick={clearSelection}
            aria-label="Deseleccionar todo"
            className="shrink-0 rounded-md p-1 transition-opacity hover:opacity-60"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
