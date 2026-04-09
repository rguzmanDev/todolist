import type {
  Book,
  Section,
  Task,
  CreateBookPayload,
  UpdateBookPayload,
  CreateSectionPayload,
  UpdateSectionPayload,
  CreateTaskPayload,
  UpdateTaskPayload,
  ApiSuccessResponse,
} from '@/lib/types'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const json = (await response.json()) as ApiSuccessResponse<T> | { error: string }

  if (!response.ok) {
    const message = 'error' in json ? json.error : 'Request failed'
    throw new Error(message)
  }

  return (json as ApiSuccessResponse<T>).data
}

const get = <T>(url: string) => request<T>(url)
const post = <T>(url: string, body: unknown) =>
  request<T>(url, { method: 'POST', body: JSON.stringify(body) })
const patch = <T>(url: string, body: unknown) =>
  request<T>(url, { method: 'PATCH', body: JSON.stringify(body) })
const del = (url: string) => request<null>(url, { method: 'DELETE' })

export const booksApi = {
  list: () => get<Book[]>('/api/books'),
  create: (payload: CreateBookPayload) => post<Book>('/api/books', payload),
  update: (id: string, payload: UpdateBookPayload) => patch<Book>(`/api/books/${id}`, payload),
  delete: (id: string) => del(`/api/books/${id}`),
}

export const sectionsApi = {
  list: (bookId: string) => get<Section[]>(`/api/books/${bookId}/sections`),
  create: (bookId: string, payload: CreateSectionPayload) =>
    post<Section>(`/api/books/${bookId}/sections`, payload),
  update: (bookId: string, sectionId: string, payload: UpdateSectionPayload) =>
    patch<Section>(`/api/books/${bookId}/sections/${sectionId}`, payload),
  delete: (bookId: string, sectionId: string) =>
    del(`/api/books/${bookId}/sections/${sectionId}`),
}

export const tasksApi = {
  listByBook: (bookId: string) => get<Task[]>(`/api/tasks?bookId=${bookId}`),
  listBySection: (bookId: string, sectionId: string) =>
    get<Task[]>(`/api/tasks?bookId=${bookId}&sectionId=${sectionId}`),
  create: (payload: CreateTaskPayload) => post<Task>('/api/tasks', payload),
  update: (id: string, payload: UpdateTaskPayload) => patch<Task>(`/api/tasks/${id}`, payload),
  delete: (id: string) => del(`/api/tasks/${id}`),
}
