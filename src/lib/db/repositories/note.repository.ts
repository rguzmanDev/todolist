import { getDb } from '../client'
import { generateId } from '@/lib/utils'
import type { Note, CreateNotePayload, UpdateNotePayload } from '@/lib/types'

interface NoteRow {
  id: string
  book_id: string
  section_id: string | null
  title: string
  content: string
  created_at: string
  updated_at: string
}

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    bookId: row.book_id,
    sectionId: row.section_id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const noteRepository = {
  findByBookId(bookId: string): Note[] {
    const rows = getDb()
      .prepare('SELECT * FROM notes WHERE book_id = ? ORDER BY updated_at DESC')
      .all(bookId) as NoteRow[]
    return rows.map(toNote)
  },

  findBySectionId(sectionId: string): Note[] {
    const rows = getDb()
      .prepare('SELECT * FROM notes WHERE section_id = ? ORDER BY updated_at DESC')
      .all(sectionId) as NoteRow[]
    return rows.map(toNote)
  },

  findDirectByBookId(bookId: string): Note[] {
    const rows = getDb()
      .prepare('SELECT * FROM notes WHERE book_id = ? AND section_id IS NULL ORDER BY updated_at DESC')
      .all(bookId) as NoteRow[]
    return rows.map(toNote)
  },

  findById(id: string): Note | null {
    const row = getDb()
      .prepare('SELECT * FROM notes WHERE id = ?')
      .get(id) as NoteRow | undefined
    return row ? toNote(row) : null
  },

  create(payload: CreateNotePayload): Note {
    const id = generateId()
    getDb()
      .prepare(`
        INSERT INTO notes (id, book_id, section_id, title, content)
        VALUES (@id, @bookId, @sectionId, @title, @content)
      `)
      .run({
        id,
        bookId: payload.bookId,
        sectionId: payload.sectionId ?? null,
        title: payload.title,
        content: payload.content ?? '',
      })
    return this.findById(id)!
  },

  update(id: string, payload: UpdateNotePayload): Note | null {
    const existing = this.findById(id)
    if (!existing) return null
    getDb()
      .prepare(`
        UPDATE notes
        SET title = @title,
            content = @content,
            updated_at = datetime('now')
        WHERE id = @id
      `)
      .run({
        title: payload.title ?? existing.title,
        content: payload.content !== undefined ? payload.content : existing.content,
        id,
      })
    return this.findById(id)
  },

  delete(id: string): void {
    getDb().prepare('DELETE FROM notes WHERE id = ?').run(id)
  },
}
