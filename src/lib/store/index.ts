'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { booksApi, sectionsApi, tasksApi, notesApi } from '@/lib/api/client'
import { toast } from '@/lib/toast'
import type {
  Book,
  Section,
  Task,
  Note,
  ActiveNote,
  TaskFilter,
  CreateBookPayload,
  UpdateBookPayload,
  CreateSectionPayload,
  UpdateSectionPayload,
  CreateTaskPayload,
  UpdateTaskPayload,
  CreateNotePayload,
  UpdateNotePayload,
} from '@/lib/types'
import type { ThemeMode } from '@/lib/theme'

interface AppState {
  books: Book[]
  sections: Section[]
  tasks: Task[]
  notes: Note[]
  activeNote: ActiveNote
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
  reorderTasks: (ids: string[]) => Promise<void>
  bulkUpdateTasks: (ids: string[], payload: UpdateTaskPayload) => Promise<void>
  bulkDeleteTasks: (ids: string[]) => Promise<void>

  fetchNotes: (bookId: string, sectionId?: string | null) => Promise<void>
  createNote: (payload: CreateNotePayload) => Promise<void>
  updateNote: (id: string, payload: UpdateNotePayload) => Promise<void>
  deleteNote: (id: string) => Promise<void>

  setActiveNote: (note: ActiveNote) => void
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
      notes: [],
      activeNote: null,
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
        set({ selectedBookId: id, selectedSectionId: null, tasks: [], notes: [], sections: [], taskFilter: 'all' })
        if (!id) return
        await Promise.all([get().fetchSections(id), get().fetchTasks(id), get().fetchNotes(id)])
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
        toast.info('Sección eliminada')
      },

      selectSection: async (id) => {
        const { selectedBookId } = get()
        set({ selectedSectionId: id, taskFilter: 'all' })
        if (!selectedBookId) return
        if (id) {
          await Promise.all([get().fetchTasks(selectedBookId, id), get().fetchNotes(selectedBookId, id)])
        } else {
          await Promise.all([get().fetchTasks(selectedBookId), get().fetchNotes(selectedBookId)])
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
        toast.success('Tarea creada')
      },

      updateTask: async (id, payload) => {
        const updated = await tasksApi.update(id, payload)
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
        }))
        await get().fetchBooks()
        const { selectedBookId } = get()
        if (selectedBookId) await get().fetchSections(selectedBookId)
        if (payload.status) {
          toast.success(payload.status === 'completed' ? 'Tarea completada ✓' : 'Tarea pendiente')
        } else {
          toast.success('Tarea actualizada')
        }
      },

      deleteTask: async (id) => {
        await tasksApi.delete(id)
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
        await get().fetchBooks()
        const { selectedBookId } = get()
        if (selectedBookId) await get().fetchSections(selectedBookId)
        toast.info('Tarea eliminada')
      },

      reorderTasks: async (ids) => {
        // optimistic: order is already set in TaskGroup state
        await tasksApi.reorder(ids)
      },

      bulkUpdateTasks: async (ids, payload) => {
        await Promise.all(ids.map((id) => tasksApi.update(id, payload)))
        await get().fetchBooks()
        const { selectedBookId, selectedSectionId } = get()
        if (selectedBookId) {
          await get().fetchTasks(selectedBookId, selectedSectionId)
          await get().fetchSections(selectedBookId)
        }
        const label = payload.status === 'completed' ? 'completadas' : payload.status === 'in_progress' ? 'en proceso' : 'pendientes'
        toast.success(`${ids.length} ${ids.length === 1 ? 'tarea' : 'tareas'} marcadas como ${label}`)
      },

      bulkDeleteTasks: async (ids) => {
        await Promise.all(ids.map((id) => tasksApi.delete(id)))
        set((state) => ({ tasks: state.tasks.filter((t) => !ids.includes(t.id)) }))
        await get().fetchBooks()
        const { selectedBookId } = get()
        if (selectedBookId) await get().fetchSections(selectedBookId)
        toast.info(`${ids.length} ${ids.length === 1 ? 'tarea eliminada' : 'tareas eliminadas'}`)
      },

      fetchNotes: async (bookId, sectionId) => {
        const notes =
          sectionId !== undefined && sectionId !== null
            ? await notesApi.listBySection(bookId, sectionId)
            : await notesApi.listByBook(bookId)
        set({ notes })
      },

      createNote: async (payload) => {
        const note = await notesApi.create(payload)
        set((state) => ({ notes: [note, ...state.notes] }))
        toast.success('Nota creada')
      },

      updateNote: async (id, payload) => {
        const updated = await notesApi.update(id, payload)
        set((state) => ({ notes: state.notes.map((n) => (n.id === id ? updated : n)) }))
      },

      deleteNote: async (id) => {
        await notesApi.delete(id)
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
        toast.info('Nota eliminada')
      },

      setActiveNote: (note) => set({ activeNote: note }),

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
