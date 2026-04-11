export const APP_NAME = 'Folio'

export const APP_DOMAIN = 'rgcore.dev'

export const APP_VERSION = '1.0.0'

export const BOOK_COLORS = [
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F59E0B',
  '#06B6D4',
] as const

export type BookColor = (typeof BOOK_COLORS)[number]

export const DEFAULT_BOOK_COLOR: BookColor = '#3B82F6'

export const PRIORITY_CONFIG = {
  low: { label: 'Bajo', className: 'bg-gray-100 text-gray-500' },
  medium: { label: 'Medio', className: 'bg-amber-100 text-amber-700' },
  high: { label: 'Alto', className: 'bg-red-100 text-red-600' },
} as const

export const TASK_FILTER_CONFIG = {
  all:         { label: 'Todos',      shortLabel: 'Todo' },
  pending:     { label: 'Pendiente',  shortLabel: 'Pend.' },
  in_progress: { label: 'En proceso', shortLabel: 'En pr.' },
  completed:   { label: 'Completado', shortLabel: 'Hecho' },
} as const
