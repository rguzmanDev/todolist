import { taskRepository } from '@/lib/db/repositories/task.repository'
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api/response'
import type { UpdateTaskPayload } from '@/lib/types'

interface RouteContext {
  params: Promise<{ taskId: string }>
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { taskId } = await params
  return withErrorHandler(async () => {
    const body = (await request.json()) as Partial<UpdateTaskPayload>
    const task = taskRepository.update(taskId, body)
    if (!task) return apiError('Task not found', 404)
    return apiSuccess(task)
  })
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { taskId } = await params
  return withErrorHandler(() => {
    const existing = taskRepository.findById(taskId)
    if (!existing) return apiError('Task not found', 404)
    taskRepository.delete(taskId)
    return apiSuccess(null, 200)
  })
}
