import { bookRepository } from '@/lib/db/repositories/book.repository'
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api/response'
import type { CreateBookPayload } from '@/lib/types'

export async function GET() {
  return withErrorHandler(() => {
    const books = bookRepository.findAll()
    return apiSuccess(books)
  })
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = (await request.json()) as Partial<CreateBookPayload>
    if (!body.name?.trim()) return apiError('Name is required', 400)
    if (!body.color?.trim()) return apiError('Color is required', 400)
    const book = bookRepository.create({ name: body.name.trim(), color: body.color, type: body.type })
    return apiSuccess(book, 201)
  })
}
