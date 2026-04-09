export function generateId(): string {
  return crypto.randomUUID()
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}
