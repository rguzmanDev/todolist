import { getDb } from '../client'
import { generateId } from '@/lib/utils'
import type { Book, BookType, CreateBookPayload, UpdateBookPayload } from '@/lib/types'

interface BookRow {
  id: string
  name: string
  color: string
  type: string
  created_at: string
  task_count: number
  pending_count: number
  note_count: number
}

function toBook(row: BookRow): Book {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    type: (row.type ?? 'tasks') as BookType,
    createdAt: row.created_at,
    taskCount: Number(row.task_count ?? 0),
    pendingCount: Number(row.pending_count ?? 0),
    noteCount: Number(row.note_count ?? 0),
  }
}

const WITH_COUNTS_SQL = `
  SELECT
    b.id,
    b.name,
    b.color,
    b.type,
    b.created_at,
    (SELECT COUNT(*) FROM tasks t WHERE t.book_id = b.id) AS task_count,
    (SELECT COUNT(*) FROM tasks t WHERE t.book_id = b.id AND t.status = 'pending') AS pending_count,
    (SELECT COUNT(*) FROM notes n WHERE n.book_id = b.id) AS note_count
  FROM books b
`

export const bookRepository = {
  findAll(): Book[] {
    const rows = getDb()
      .prepare(`${WITH_COUNTS_SQL} ORDER BY b.created_at ASC`)
      .all() as BookRow[]
    return rows.map(toBook)
  },

  findById(id: string): Book | null {
    const row = getDb()
      .prepare(`${WITH_COUNTS_SQL} WHERE b.id = ?`)
      .get(id) as BookRow | undefined
    return row ? toBook(row) : null
  },

  create(payload: CreateBookPayload): Book {
    const id = generateId()
    getDb()
      .prepare('INSERT INTO books (id, name, color, type) VALUES (@id, @name, @color, @type)')
      .run({ id, name: payload.name, color: payload.color, type: payload.type ?? 'tasks' })
    return this.findById(id)!
  },

  update(id: string, payload: UpdateBookPayload): Book | null {
    const existing = this.findById(id)
    if (!existing) return null
    getDb()
      .prepare('UPDATE books SET name = @name, color = @color, type = @type WHERE id = @id')
      .run({ name: payload.name ?? existing.name, color: payload.color ?? existing.color, type: payload.type ?? existing.type, id })
    return this.findById(id)
  },

  delete(id: string): void {
    getDb().prepare('DELETE FROM books WHERE id = ?').run(id)
  },
}
