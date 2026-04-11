import { noteRepository } from '@/lib/db/repositories/note.repository'
import { bookRepository } from '@/lib/db/repositories/book.repository'
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api/response'
import type { CreateNotePayload } from '@/lib/types'

export async function GET(request: Request) {
  return withErrorHandler(() => {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')
    const sectionId = searchParams.get('sectionId')

    if (!bookId) return apiError('bookId is required', 400)

    if (sectionId === 'null' || sectionId === '') {
      return apiSuccess(noteRepository.findDirectByBookId(bookId))
    }

    if (sectionId) {
      return apiSuccess(noteRepository.findBySectionId(sectionId))
    }

    return apiSuccess(noteRepository.findByBookId(bookId))
  })
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = (await request.json()) as Partial<CreateNotePayload>
    if (!body.bookId) return apiError('bookId is required', 400)
    if (!body.title?.trim() && !body.content?.trim()) return apiError('title or content is required', 400)

    const book = bookRepository.findById(body.bookId)
    if (!book) return apiError('Book not found', 404)

    const note = noteRepository.create({
      bookId: body.bookId,
      sectionId: body.sectionId ?? null,
      title: body.title ?? '',
      content: body.content ?? '',
    })
    return apiSuccess(note, 201)
  })
}
