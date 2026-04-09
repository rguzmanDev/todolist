import { getDb } from '../client'
import { generateId } from '@/lib/utils'
import type { Book, CreateBookPayload, UpdateBookPayload } from '@/lib/types'

interface BookRow {
  id: string
  name: string
  color: string
  created_at: string
  task_count: number
  pending_count: number
}

function toBook(row: BookRow): Book {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
    taskCount: Number(row.task_count ?? 0),
    pendingCount: Number(row.pending_count ?? 0),
  }
}

const WITH_COUNTS_SQL = `
  SELECT
    b.id,
    b.name,
    b.color,
    b.created_at,
    COUNT(t.id) AS task_count,
    SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) AS pending_count
  FROM books b
  LEFT JOIN tasks t ON t.book_id = b.id
`

export const bookRepository = {
  findAll(): Book[] {
    const rows = getDb()
      .prepare(`${WITH_COUNTS_SQL} GROUP BY b.id ORDER BY b.created_at ASC`)
      .all() as BookRow[]
    return rows.map(toBook)
  },

  findById(id: string): Book | null {
    const row = getDb()
      .prepare(`${WITH_COUNTS_SQL} WHERE b.id = ? GROUP BY b.id`)
      .get(id) as BookRow | undefined
    return row ? toBook(row) : null
  },

  create(payload: CreateBookPayload): Book {
    const id = generateId()
    getDb()
      .prepare('INSERT INTO books (id, name, color) VALUES (@id, @name, @color)')
      .run({ id, name: payload.name, color: payload.color })
    return this.findById(id)!
  },

  update(id: string, payload: UpdateBookPayload): Book | null {
    const existing = this.findById(id)
    if (!existing) return null
    getDb()
      .prepare('UPDATE books SET name = @name, color = @color WHERE id = @id')
      .run({ name: payload.name ?? existing.name, color: payload.color ?? existing.color, id })
    return this.findById(id)
  },

  delete(id: string): void {
    getDb().prepare('DELETE FROM books WHERE id = ?').run(id)
  },
}
