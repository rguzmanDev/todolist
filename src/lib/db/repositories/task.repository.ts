import { getDb } from '../client'
import { generateId } from '@/lib/utils'
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '@/lib/types'

interface TaskRow {
  id: string
  book_id: string
  section_id: string | null
  title: string
  description: string | null
  priority: string
  status: string
  created_at: string
  completed_at: string | null
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    bookId: row.book_id,
    sectionId: row.section_id,
    title: row.title,
    description: row.description,
    priority: row.priority as Task['priority'],
    status: row.status as Task['status'],
    createdAt: row.created_at,
    completedAt: row.completed_at,
  }
}

export const taskRepository = {
  findByBookId(bookId: string): Task[] {
    const rows = getDb()
      .prepare(
        'SELECT * FROM tasks WHERE book_id = ? ORDER BY created_at ASC'
      )
      .all(bookId) as TaskRow[]
    return rows.map(toTask)
  },

  findBySectionId(sectionId: string): Task[] {
    const rows = getDb()
      .prepare(
        'SELECT * FROM tasks WHERE section_id = ? ORDER BY created_at ASC'
      )
      .all(sectionId) as TaskRow[]
    return rows.map(toTask)
  },

  findDirectByBookId(bookId: string): Task[] {
    const rows = getDb()
      .prepare(
        'SELECT * FROM tasks WHERE book_id = ? AND section_id IS NULL ORDER BY created_at ASC'
      )
      .all(bookId) as TaskRow[]
    return rows.map(toTask)
  },

  findById(id: string): Task | null {
    const row = getDb()
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .get(id) as TaskRow | undefined
    return row ? toTask(row) : null
  },

  create(payload: CreateTaskPayload): Task {
    const id = generateId()
    getDb()
      .prepare(`
        INSERT INTO tasks (id, book_id, section_id, title, description, priority)
        VALUES (@id, @bookId, @sectionId, @title, @description, @priority)
      `)
      .run({
        id,
        bookId: payload.bookId,
        sectionId: payload.sectionId ?? null,
        title: payload.title,
        description: payload.description ?? null,
        priority: payload.priority ?? 'medium',
      })
    return this.findById(id)!
  },

  update(id: string, payload: UpdateTaskPayload): Task | null {
    const existing = this.findById(id)
    if (!existing) return null

    const completedAt =
      payload.status === 'completed'
        ? (payload.completedAt ?? new Date().toISOString())
        : payload.status === 'pending'
          ? null
          : (payload.completedAt !== undefined ? payload.completedAt : existing.completedAt)

    getDb()
      .prepare(`
        UPDATE tasks
        SET title = @title,
            description = @description,
            priority = @priority,
            status = @status,
            completed_at = @completedAt
        WHERE id = @id
      `)
      .run({
        title: payload.title ?? existing.title,
        description: payload.description !== undefined ? payload.description : existing.description,
        priority: payload.priority ?? existing.priority,
        status: payload.status ?? existing.status,
        completedAt,
        id,
      })
    return this.findById(id)
  },

  delete(id: string): void {
    getDb().prepare('DELETE FROM tasks WHERE id = ?').run(id)
  },
}
