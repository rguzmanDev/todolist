'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { booksApi, sectionsApi, tasksApi } from '@/lib/api/client'
import type {
  Book,
  Section,
  Task,
  TaskFilter,
  CreateBookPayload,
  UpdateBookPayload,
  CreateSectionPayload,
  UpdateSectionPayload,
  CreateTaskPayload,
  UpdateTaskPayload,
} from '@/lib/types'
import type { ThemeMode } from '@/lib/theme'

interface AppState {
  books: Book[]
  sections: Section[]
  tasks: Task[]
  selectedBookId: string | null
  selectedSectionId: string | null
  taskFilter: TaskFilter
  theme: ThemeMode
  isLoadingBooks: boolean
  isLoadingTasks: boolean

  fetchBooks: () => Promise<void>
  createBook: (payload: CreateBookPayload) => Promise<void>
  updateBook: (id: string, payload: UpdateBookPayload) => Promise<void>
  deleteBook: (id: string) => Promise<void>
  selectBook: (id: string | null) => Promise<void>

  fetchSections: (bookId: string) => Promise<void>
  createSection: (bookId: string, payload: CreateSectionPayload) => Promise<void>
  updateSection: (bookId: string, sectionId: string, payload: UpdateSectionPayload) => Promise<void>
  deleteSection: (bookId: string, sectionId: string) => Promise<void>
  selectSection: (id: string | null) => Promise<void>

  fetchTasks: (bookId: string, sectionId?: string | null) => Promise<void>
  createTask: (payload: CreateTaskPayload) => Promise<void>
  updateTask: (id: string, payload: UpdateTaskPayload) => Promise<void>
  deleteTask: (id: string) => Promise<void>

  setTaskFilter: (filter: TaskFilter) => void
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      books: [],
      sections: [],
      tasks: [],
      selectedBookId: null,
      selectedSectionId: null,
      taskFilter: 'all',
      theme: 'light',
      isLoadingBooks: false,
      isLoadingTasks: false,

      fetchBooks: async () => {
        set({ isLoadingBooks: true })
        const books = await booksApi.list()
        set({ books, isLoadingBooks: false })
      },

      createBook: async (payload) => {
        const book = await booksApi.create(payload)
        set((state) => ({ books: [...state.books, book] }))
      },

      updateBook: async (id, payload) => {
        const updated = await booksApi.update(id, payload)
        set((state) => ({
          books: state.books.map((b) => (b.id === id ? updated : b)),
        }))
      },

      deleteBook: async (id) => {
        await booksApi.delete(id)
        set((state) => ({
          books: state.books.filter((b) => b.id !== id),
          sections: state.sections.filter((s) => s.bookId !== id),
          tasks: state.tasks.filter((t) => t.bookId !== id),
          selectedBookId: state.selectedBookId === id ? null : state.selectedBookId,
          selectedSectionId:
            state.sections.find((s) => s.id === state.selectedSectionId)?.bookId === id
              ? null
              : state.selectedSectionId,
        }))
      },

      selectBook: async (id) => {
        set({ selectedBookId: id, selectedSectionId: null, tasks: [], sections: [], taskFilter: 'all' })
        if (!id) return
        await Promise.all([get().fetchSections(id), get().fetchTasks(id)])
      },

      fetchSections: async (bookId) => {
        const sections = await sectionsApi.list(bookId)
        set({ sections })
      },

      createSection: async (bookId, payload) => {
        const section = await sectionsApi.create(bookId, payload)
        set((state) => ({ sections: [...state.sections, section] }))
        await get().fetchBooks()
      },

      updateSection: async (bookId, sectionId, payload) => {
        const updated = await sectionsApi.update(bookId, sectionId, payload)
        set((state) => ({
          sections: state.sections.map((s) => (s.id === sectionId ? updated : s)),
        }))
      },

      deleteSection: async (bookId, sectionId) => {
        await sectionsApi.delete(bookId, sectionId)
        set((state) => ({
          sections: state.sections.filter((s) => s.id !== sectionId),
          tasks: state.tasks.filter((t) => t.sectionId !== sectionId),
          selectedSectionId:
            state.selectedSectionId === sectionId ? null : state.selectedSectionId,
        }))
        await get().fetchBooks()
      },

      selectSection: async (id) => {
        const { selectedBookId } = get()
        set({ selectedSectionId: id, taskFilter: 'all' })
        if (!selectedBookId) return
        if (id) {
          await get().fetchTasks(selectedBookId, id)
        } else {
          await get().fetchTasks(selectedBookId)
        }
      },

      fetchTasks: async (bookId, sectionId) => {
        set({ isLoadingTasks: true })
        const tasks =
          sectionId !== undefined && sectionId !== null
            ? await tasksApi.listBySection(bookId, sectionId)
            : await tasksApi.listByBook(bookId)
        set({ tasks, isLoadingTasks: false })
      },

      createTask: async (payload) => {
        const task = await tasksApi.create(payload)
        set((state) => ({ tasks: [...state.tasks, task] }))
        await get().fetchBooks()
        const { selectedBookId } = get()
        if (selectedBookId) await get().fetchSections(selectedBookId)
      },

      updateTask: async (id, payload) => {
        const updated = await tasksApi.update(id, payload)
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
        }))
        await get().fetchBooks()
        const { selectedBookId } = get()
        if (selectedBookId) await get().fetchSections(selectedBookId)
      },

      deleteTask: async (id) => {
        await tasksApi.delete(id)
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
        await get().fetchBooks()
        const { selectedBookId } = get()
        if (selectedBookId) await get().fetchSections(selectedBookId)
      },

      setTaskFilter: (filter) => set({ taskFilter: filter }),

      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        }))
      },

      setTheme: (theme: ThemeMode) => {
        set({ theme })
      },
    }),
    { name: 'folio-store' }
  )
)

export function selectSelectedBook(state: AppState): Book | null {
  return state.books.find((b) => b.id === state.selectedBookId) ?? null
}

export function selectSelectedSection(state: AppState): Section | null {
  return state.sections.find((s) => s.id === state.selectedSectionId) ?? null
}
