'use client'

import { useAppStore } from '@/lib/store'
import { TASK_FILTER_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { TaskFilter } from '@/lib/types'

const FILTERS = Object.entries(TASK_FILTER_CONFIG) as [TaskFilter, { label: string }][]

export default function TaskFilters() {
  const taskFilter = useAppStore((s) => s.taskFilter)
  const setTaskFilter = useAppStore((s) => s.setTaskFilter)

  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
      {FILTERS.map(([value, config]) => (
        <button
          key={value}
          onClick={() => setTaskFilter(value)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition-colors',
            taskFilter === value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {config.label}
        </button>
      ))}
    </div>
  )
}
