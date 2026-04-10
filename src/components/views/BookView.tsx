'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import TaskGroup from '@/components/tasks/TaskGroup'
import type { Task } from '@/lib/types'
import EmptyState from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'

function SectionDivider({ name, count }: { name: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 mt-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{name}</span>
      {count > 0 && (
        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">{count}</span>
      )}
      <div className="flex-1 border-t border-gray-100" />
    </div>
  )
}

function WelcomeIcon() {
  return (
    <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  )
}

export default function BookView() {
  const sections = useAppStore((s) => s.sections)
  const tasks = useAppStore((s) => s.tasks)
  const taskFilter = useAppStore((s) => s.taskFilter)
  const isLoadingTasks = useAppStore((s) => s.isLoadingTasks)
  const selectedBookId = useAppStore((s) => s.selectedBookId)

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
        <p className="text-sm text-gray-400">Cargando tareas...</p>
      </div>
    )
  }

  const directTasks = tasksBySection.get(null) ?? []
  const allEmpty = filteredTasks.length === 0

  if (allEmpty) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          icon={<WelcomeIcon />}
          title="Sin tareas"
          description="Usa el botón Nueva tarea arriba para agregar tu primer tarea"
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto py-2">
      {directTasks.length > 0 && (
        <div>
          {sections.length > 0 && (
            <SectionDivider name="Tareas directas" count={directTasks.length} />
          )}
          <TaskGroup tasks={directTasks} />
        </div>
      )}

      {sections.map((section) => {
        const sectionTasks = tasksBySection.get(section.id) ?? []
        if (sectionTasks.length === 0) return null
        return (
          <div key={section.id}>
            <SectionDivider name={section.name} count={sectionTasks.length} />
            <TaskGroup tasks={sectionTasks} section={section} />
          </div>
        )
      })}
    </div>
  )
}
