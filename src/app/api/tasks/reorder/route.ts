import { taskRepository } from '@/lib/db/repositories/task.repository'
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api/response'

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = (await request.json()) as { ids?: unknown }
    if (!Array.isArray(body.ids) || body.ids.some((id) => typeof id !== 'string')) {
      return apiError('ids must be an array of strings', 400)
    }
    taskRepository.reorder(body.ids as string[])
    return apiSuccess(null)
  })
}
