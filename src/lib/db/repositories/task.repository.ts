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
  sort_order: number
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
        'SELECT * FROM tasks WHERE book_id = ? ORDER BY sort_order ASC, created_at ASC'
      )
      .all(bookId) as TaskRow[]
    return rows.map(toTask)
  },

  findBySectionId(sectionId: string): Task[] {
    const rows = getDb()
      .prepare(
        'SELECT * FROM tasks WHERE section_id = ? ORDER BY sort_order ASC, created_at ASC'
      )
      .all(sectionId) as TaskRow[]
    return rows.map(toTask)
  },

  findDirectByBookId(bookId: string): Task[] {
    const rows = getDb()
      .prepare(
        'SELECT * FROM tasks WHERE book_id = ? AND section_id IS NULL ORDER BY sort_order ASC, created_at ASC'
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
    // assign sort_order = max existing + 1 for the same group
    const maxOrderRow = getDb()
      .prepare(
        payload.sectionId
          ? 'SELECT COALESCE(MAX(sort_order), 0) as m FROM tasks WHERE section_id = ?'
          : 'SELECT COALESCE(MAX(sort_order), 0) as m FROM tasks WHERE book_id = ? AND section_id IS NULL'
      )
      .get(payload.sectionId ?? payload.bookId) as { m: number }
    const sortOrder = (maxOrderRow?.m ?? 0) + 1
    getDb()
      .prepare(`
        INSERT INTO tasks (id, book_id, section_id, title, description, priority, sort_order)
        VALUES (@id, @bookId, @sectionId, @title, @description, @priority, @sortOrder)
      `)
      .run({
        id,
        bookId: payload.bookId,
        sectionId: payload.sectionId ?? null,
        title: payload.title,
        description: payload.description ?? null,
        priority: payload.priority ?? 'medium',
        sortOrder,
      })
    return this.findById(id)!
  },

  update(id: string, payload: UpdateTaskPayload): Task | null {
    const existing = this.findById(id)
    if (!existing) return null

    const completedAt =
      payload.status === 'completed'
        ? (payload.completedAt ?? new Date().toISOString())
        : (payload.status === 'pending' || payload.status === 'in_progress')
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

  reorder(ids: string[]): void {
    const stmt = getDb().prepare('UPDATE tasks SET sort_order = @order WHERE id = @id')
    const runAll = getDb().transaction((pairs: { id: string; order: number }[]) => {
      for (const p of pairs) stmt.run(p)
    })
    runAll(ids.map((id, i) => ({ id, order: i })))
  },
}
