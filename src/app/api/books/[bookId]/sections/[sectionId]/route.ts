import { sectionRepository } from '@/lib/db/repositories/section.repository'
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api/response'
import type { UpdateSectionPayload } from '@/lib/types'

interface RouteContext {
  params: Promise<{ bookId: string; sectionId: string }>
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { sectionId } = await params
  return withErrorHandler(async () => {
    const body = (await request.json()) as Partial<UpdateSectionPayload>
    if (!body.name?.trim()) return apiError('Name is required', 400)
    const section = sectionRepository.update(sectionId, { name: body.name.trim() })
    if (!section) return apiError('Section not found', 404)
    return apiSuccess(section)
  })
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { sectionId } = await params
  return withErrorHandler(() => {
    const existing = sectionRepository.findById(sectionId)
    if (!existing) return apiError('Section not found', 404)
    sectionRepository.delete(sectionId)
    return apiSuccess(null, 200)
  })
}
