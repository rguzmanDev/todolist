import { taskRepository } from '@/lib/db/repositories/task.repository'
import { bookRepository } from '@/lib/db/repositories/book.repository'
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api/response'
import type { CreateTaskPayload } from '@/lib/types'

export async function GET(request: Request) {
  return withErrorHandler(() => {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')
    const sectionId = searchParams.get('sectionId')

    if (!bookId) return apiError('bookId is required', 400)

    if (sectionId === 'null' || sectionId === '') {
      return apiSuccess(taskRepository.findDirectByBookId(bookId))
    }

    if (sectionId) {
      return apiSuccess(taskRepository.findBySectionId(sectionId))
    }

    return apiSuccess(taskRepository.findByBookId(bookId))
  })
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = (await request.json()) as Partial<CreateTaskPayload>
    if (!body.bookId) return apiError('bookId is required', 400)
    if (!body.title?.trim()) return apiError('Title is required', 400)

    const book = bookRepository.findById(body.bookId)
    if (!book) return apiError('Book not found', 404)

    const task = taskRepository.create({
      bookId: body.bookId,
      sectionId: body.sectionId ?? null,
      title: body.title.trim(),
      description: body.description ?? null,
      priority: body.priority ?? 'medium',
    })
    return apiSuccess(task, 201)
  })
}
