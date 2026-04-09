export type TaskPriority = 'low' | 'medium' | 'high'

export type TaskStatus = 'pending' | 'completed'

export type TaskFilter = TaskStatus | 'all'

export interface Book {
  id: string
  name: string
  color: string
  createdAt: string
  taskCount: number
  pendingCount: number
}

export interface Section {
  id: string
  bookId: string
  name: string
  createdAt: string
  taskCount: number
  pendingCount: number
}

export interface Task {
  id: string
  bookId: string
  sectionId: string | null
  title: string
  description: string | null
  priority: TaskPriority
  status: TaskStatus
  createdAt: string
  completedAt: string | null
}

export interface CreateBookPayload {
  name: string
  color: string
}

export interface UpdateBookPayload {
  name?: string
  color?: string
}

export interface CreateSectionPayload {
  name: string
}

export interface UpdateSectionPayload {
  name: string
}

export interface CreateTaskPayload {
  bookId: string
  sectionId?: string | null
  title: string
  description?: string | null
  priority?: TaskPriority
}

export interface UpdateTaskPayload {
  title?: string
  description?: string | null
  priority?: TaskPriority
  status?: TaskStatus
  completedAt?: string | null
}

export interface ApiSuccessResponse<T> {
  data: T
}

export interface ApiErrorResponse {
  error: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
