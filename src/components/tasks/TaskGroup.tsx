'use client'

import TaskItem from '@/components/tasks/TaskItem'
import EmptyState from '@/components/ui/EmptyState'
import type { Task, Section } from '@/lib/types'

interface TaskGroupProps {
  tasks: Task[]
  section?: Section | null
  emptyMessage?: string
}

function BookIcon() {
  return (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  )
}

export default function TaskGroup({ tasks, section, emptyMessage }: TaskGroupProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<BookIcon />}
        title={emptyMessage ?? 'No tasks here'}
        description="Add a task to get started"
      />
    )
  }

  return (
    <div className="divide-y" style={{ borderColor: 'var(--color-border-divider)' }}>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  )
}
