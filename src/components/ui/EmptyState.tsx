'use client'

import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div style={{ color: 'var(--color-text-secondary)' }}>{icon}</div>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{title}</p>
        {description && <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
