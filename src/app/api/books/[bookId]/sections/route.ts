import { bookRepository } from '@/lib/db/repositories/book.repository'
import { sectionRepository } from '@/lib/db/repositories/section.repository'
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api/response'
import type { CreateSectionPayload } from '@/lib/types'

interface RouteContext {
  params: Promise<{ bookId: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { bookId } = await params
  return withErrorHandler(() => {
    const book = bookRepository.findById(bookId)
    if (!book) return apiError('Book not found', 404)
    const sections = sectionRepository.findByBookId(bookId)
    return apiSuccess(sections)
  })
}

export async function POST(request: Request, { params }: RouteContext) {
  const { bookId } = await params
  return withErrorHandler(async () => {
    const book = bookRepository.findById(bookId)
    if (!book) return apiError('Book not found', 404)
    const body = (await request.json()) as Partial<CreateSectionPayload>
    if (!body.name?.trim()) return apiError('Name is required', 400)
    const section = sectionRepository.create(bookId, { name: body.name.trim() })
    return apiSuccess(section, 201)
  })
}
