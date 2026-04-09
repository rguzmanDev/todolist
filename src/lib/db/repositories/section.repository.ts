import { getDb } from '../client'
import { generateId } from '@/lib/utils'
import type { Section, CreateSectionPayload, UpdateSectionPayload } from '@/lib/types'

interface SectionRow {
  id: string
  book_id: string
  name: string
  created_at: string
  task_count: number
  pending_count: number
}

function toSection(row: SectionRow): Section {
  return {
    id: row.id,
    bookId: row.book_id,
    name: row.name,
    createdAt: row.created_at,
    taskCount: Number(row.task_count ?? 0),
    pendingCount: Number(row.pending_count ?? 0),
  }
}

const WITH_COUNTS_SQL = `
  SELECT
    s.id,
    s.book_id,
    s.name,
    s.created_at,
    COUNT(t.id) AS task_count,
    SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) AS pending_count
  FROM sections s
  LEFT JOIN tasks t ON t.section_id = s.id
`

export const sectionRepository = {
  findByBookId(bookId: string): Section[] {
    const rows = getDb()
      .prepare(
        `${WITH_COUNTS_SQL} WHERE s.book_id = ? GROUP BY s.id ORDER BY s.created_at ASC`
      )
      .all(bookId) as SectionRow[]
    return rows.map(toSection)
  },

  findById(id: string): Section | null {
    const row = getDb()
      .prepare(`${WITH_COUNTS_SQL} WHERE s.id = ? GROUP BY s.id`)
      .get(id) as SectionRow | undefined
    return row ? toSection(row) : null
  },

  create(bookId: string, payload: CreateSectionPayload): Section {
    const id = generateId()
    getDb()
      .prepare('INSERT INTO sections (id, book_id, name) VALUES (@id, @bookId, @name)')
      .run({ id, bookId, name: payload.name })
    return this.findById(id)!
  },

  update(id: string, payload: UpdateSectionPayload): Section | null {
    const existing = this.findById(id)
    if (!existing) return null
    getDb()
      .prepare('UPDATE sections SET name = @name WHERE id = @id')
      .run({ name: payload.name, id })
    return this.findById(id)
  },

  delete(id: string): void {
    getDb().prepare('DELETE FROM sections WHERE id = ?').run(id)
  },
}
