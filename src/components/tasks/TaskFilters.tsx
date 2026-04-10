'use client'

import { useAppStore } from '@/lib/store'
import { TASK_FILTER_CONFIG } from '@/lib/constants'
import type { TaskFilter } from '@/lib/types'

const FILTERS = Object.entries(TASK_FILTER_CONFIG) as [TaskFilter, { label: string }][]

export default function TaskFilters() {
  const taskFilter = useAppStore((s) => s.taskFilter)
  const setTaskFilter = useAppStore((s) => s.setTaskFilter)

  return (
    <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: 'var(--color-badge-bg)' }}>
      {FILTERS.map(([value, config]) => (
        <button
          key={value}
          onClick={() => setTaskFilter(value)}
          className="rounded-md px-3 py-1 text-xs font-medium transition-colors"
          style={taskFilter === value
            ? { backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }
            : { color: 'var(--color-text-secondary)' }
          }
        >
          {config.label}
        </button>
      ))}
    </div>
  )
}
