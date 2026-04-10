'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import BookForm from '@/components/books/BookForm'
import SectionForm from '@/components/sections/SectionForm'
import { cn, pluralize } from '@/lib/utils'
import { APP_NAME, APP_DOMAIN } from '@/lib/constants'
import type { Book, Section } from '@/lib/types'

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={cn('h-3.5 w-3.5 text-gray-400 transition-transform', open && 'rotate-90')}
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
    </svg>
  )
}

interface SectionRowProps {
  section: Section
  bookId: string
  isSelected: boolean
  onSelect: () => void
}

function SectionRow({ section, bookId, isSelected, onSelect }: SectionRowProps) {
  const [showEdit, setShowEdit] = useState(false)

  return (
    <>
      <div
        className={cn(
          'group flex w-full items-center justify-between rounded-md px-3 py-1.5 transition-colors',
          isSelected
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-gray-500 hover:bg-gray-700/30 hover:text-gray-300'
        )}
      >
        <button
          onClick={onSelect}
          className="flex-1 truncate text-left text-xs"
        >
          {section.name}
        </button>
        <div className="flex items-center gap-1.5">
          {section.pendingCount > 0 && (
            <span className={cn(
              'rounded-full px-1.5 py-0.5 text-xs font-medium',
              isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-700 text-gray-300'
            )}>
              {section.pendingCount}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setShowEdit(true) }}
            className="invisible rounded p-0.5 hover:bg-gray-600 group-hover:visible"
            aria-label="Edit section"
          >
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z" />
            </svg>
          </button>
        </div>
      </div>
      {showEdit && (
        <SectionForm
          open={showEdit}
          onClose={() => setShowEdit(false)}
          bookId={bookId}
          section={section}
        />
      )}
    </>
  )
}

interface BookRowProps {
  book: Book
  sections: Section[]
  isSelected: boolean
  selectedSectionId: string | null
  onSelectBook: () => void
  onSelectSection: (id: string | null) => void
}

function BookRow({
  book,
  sections,
  isSelected,
  selectedSectionId,
  onSelectBook,
  onSelectSection,
}: BookRowProps) {
  const [expanded, setExpanded] = useState(isSelected)
  const [showEdit, setShowEdit] = useState(false)
  const [showNewSection, setShowNewSection] = useState(false)
  const deleteBook = useAppStore((s) => s.deleteBook)

  const handleBookClick = () => {
    onSelectBook()
    setExpanded(true)
  }

  const hasSections = sections.length > 0

  return (
    <>
      <div>
        <div className="group flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-gray-700/40">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex h-5 w-5 shrink-0 items-center justify-center"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronIcon open={expanded} />
          </button>

          <button
            onClick={handleBookClick}
            className={cn(
              'flex flex-1 items-center gap-2 truncate rounded py-0.5 text-sm font-medium',
              isSelected && !selectedSectionId ? 'text-white' : 'text-gray-300 hover:text-white'
            )}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: book.color }}
            />
            <span className="truncate">{book.name}</span>
          </button>

          {book.pendingCount > 0 && (
            <span className="shrink-0 rounded-full bg-gray-700 px-1.5 py-0.5 text-xs text-gray-300">
              {book.pendingCount}
            </span>
          )}

          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={(e) => { e.stopPropagation(); setShowNewSection(true) }}
              className="rounded p-1 text-gray-400 hover:bg-gray-600 hover:text-gray-200"
              aria-label="Add section"
            >
              <PlusIcon />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowEdit(true) }}
              className="rounded p-1 text-gray-400 hover:bg-gray-600 hover:text-gray-200"
              aria-label="Edit book"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Delete "${book.name}" and all its tasks?`)) deleteBook(book.id)
              }}
              className="rounded p-1 text-gray-400 hover:bg-red-900/40 hover:text-red-400"
              aria-label="Delete book"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.559a.75.75 0 1 0-1.492.149l.66 6.6A1.75 1.75 0 0 0 5.405 15h5.19a1.75 1.75 0 0 0 1.74-1.692l.661-6.6a.75.75 0 0 0-1.492-.149l-.66 6.6a.25.25 0 0 1-.249.241h-5.19a.25.25 0 0 1-.249-.241ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
              </svg>
            </button>
          </div>
        </div>

        {expanded && hasSections && (
          <div className="ml-6 mt-0.5 flex flex-col gap-0.5 border-l border-gray-700 pl-2">
            {sections.map((section) => (
              <SectionRow
                key={section.id}
                section={section}
                bookId={book.id}
                isSelected={selectedSectionId === section.id}
                onSelect={() => onSelectSection(section.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showEdit && (
        <BookForm open={showEdit} onClose={() => setShowEdit(false)} book={book} />
      )}
      {showNewSection && (
        <SectionForm
          open={showNewSection}
          onClose={() => setShowNewSection(false)}
          bookId={book.id}
        />
      )}
    </>
  )
}

export default function Sidebar() {
  const [showNewBook, setShowNewBook] = useState(false)

  const books = useAppStore((s) => s.books)
  const sections = useAppStore((s) => s.sections)
  const selectedBookId = useAppStore((s) => s.selectedBookId)
  const selectedSectionId = useAppStore((s) => s.selectedSectionId)
  const selectBook = useAppStore((s) => s.selectBook)
  const selectSection = useAppStore((s) => s.selectSection)

  const totalPending = books.reduce((sum, b) => sum + b.pendingCount, 0)

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-gray-900">
      <div className="flex items-center gap-2.5 border-b border-gray-700/50 px-4 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
          <svg className="h-4 w-4 text-white" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{APP_NAME}</p>
          {totalPending > 0 && (
            <p className="text-xs text-gray-400">
              {totalPending} {pluralize(totalPending, 'tarea', 'tareas')} pendiente
            </p>
          )}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 pt-3">
        {books.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-gray-500">
            Sin libros aún. Crea uno abajo.
          </p>
        ) : (
          books.map((book) => {
            const bookSections = sections.filter((s) => s.bookId === book.id)
            return (
              <BookRow
                key={book.id}
                book={book}
                sections={bookSections}
                isSelected={selectedBookId === book.id}
                selectedSectionId={selectedBookId === book.id ? selectedSectionId : null}
                onSelectBook={() => selectBook(book.id)}
                onSelectSection={(id) => selectSection(id)}
              />
            )
          })
        )}
      </nav>

      <div className="border-t border-gray-700/50 p-3">
        <button
          onClick={() => setShowNewBook(true)}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors"
        >
          <PlusIcon />
          Nuevo libro
        </button>
        <p className="mt-2 text-center text-xs text-gray-600">{APP_DOMAIN}</p>
      </div>

      <BookForm open={showNewBook} onClose={() => setShowNewBook(false)} />
    </aside>
  )
}
