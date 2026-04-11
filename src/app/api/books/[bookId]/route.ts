import { bookRepository } from '@/lib/db/repositories/book.repository'
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api/response'
import type { UpdateBookPayload } from '@/lib/types'

interface RouteContext {
  params: Promise<{ bookId: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { bookId } = await params
  return withErrorHandler(() => {
    const book = bookRepository.findById(bookId)
    if (!book) return apiError('Book not found', 404)
    return apiSuccess(book)
  })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { bookId } = await params
  return withErrorHandler(async () => {
    const body = (await request.json()) as Partial<UpdateBookPayload>
    const book = bookRepository.update(bookId, {
      name: body.name?.trim(),
      color: body.color,
      type: body.type,
    })
    if (!book) return apiError('Book not found', 404)
    return apiSuccess(book)
  })
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { bookId } = await params
  return withErrorHandler(() => {
    const existing = bookRepository.findById(bookId)
    if (!existing) return apiError('Book not found', 404)
    bookRepository.delete(bookId)
    return apiSuccess(null, 200)
  })
}
