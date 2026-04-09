'use client'

import { useAppStore, selectFilteredTasks } from '@/lib/store'
import TaskGroup from '@/components/tasks/TaskGroup'
import EmptyState from '@/components/ui/EmptyState'

function TaskIcon() {
  return (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  )
}

export default function SectionView() {
  const filteredTasks = useAppStore(selectFilteredTasks)
  const isLoadingTasks = useAppStore((s) => s.isLoadingTasks)

  if (isLoadingTasks) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">Loading tasks...</p>
      </div>
    )
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          icon={<TaskIcon />}
          title="No tasks in this section"
          description="Add a task to get started"
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto py-2">
      <TaskGroup tasks={filteredTasks} />
    </div>
  )
}
