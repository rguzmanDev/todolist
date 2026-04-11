import { noteRepository } from '@/lib/db/repositories/note.repository'
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api/response'
import type { UpdateNotePayload } from '@/lib/types'

interface RouteContext {
  params: Promise<{ noteId: string }>
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { noteId } = await params
  return withErrorHandler(async () => {
    const body = (await request.json()) as Partial<UpdateNotePayload>
    const note = noteRepository.update(noteId, body)
    if (!note) return apiError('Note not found', 404)
    return apiSuccess(note)
  })
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { noteId } = await params
  return withErrorHandler(() => {
    const existing = noteRepository.findById(noteId)
    if (!existing) return apiError('Note not found', 404)
    noteRepository.delete(noteId)
    return apiSuccess(null, 200)
  })
}
