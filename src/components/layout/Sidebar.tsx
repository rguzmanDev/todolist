'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, ChevronDown } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import BookForm from '@/components/books/BookForm'
import SectionForm from '@/components/sections/SectionForm'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn, pluralize } from '@/lib/utils'
import { APP_NAME, APP_DOMAIN } from '@/lib/constants'
import { useTheme } from '@/lib/hooks/useTheme'
import type { Book, Section } from '@/lib/types'

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <ChevronDown
      size={14}
      className={cn('transition-transform', open && 'rotate-180')}
      style={{ color: 'var(--color-sidebar-text)' }}
    />
  )
}

function PlusIcon() {
  return <Plus size={16} />
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
        className="group flex w-full items-center justify-between rounded-md px-3 py-1.5 transition-colors"
        style={{
          backgroundColor: isSelected ? 'var(--color-sidebar-accent)' : 'transparent',
          color: isSelected ? '#FFFFFF' : 'var(--color-sidebar-text)',
        }}
      >
        <button
          onClick={onSelect}
          className="flex-1 truncate text-left text-xs"
        >
          {section.name}
        </button>
        <div className="flex items-center gap-1.5">
          {section.pendingCount > 0 && (
            <span
              className="rounded-full px-1.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--color-sidebar-hover)',
                color: isSelected ? '#FFFFFF' : 'var(--color-sidebar-text)',
              }}
            >
              {section.pendingCount}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setShowEdit(true) }}
            className="invisible rounded p-0.5 transition-colors group-hover:visible"
            style={{
              backgroundColor: 'var(--color-sidebar-hover)',
              color: 'var(--color-sidebar-text)',
            }}
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
        <div className="group flex items-center gap-1 rounded-md px-2 py-1 transition-colors" style={{ backgroundColor: isSelected ? 'var(--color-sidebar-accent)' : 'transparent' }}>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex h-5 w-5 shrink-0 items-center justify-center"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronIcon open={expanded} />
          </button>

          <button
            onClick={handleBookClick}
            className="flex flex-1 items-center gap-2 truncate rounded py-0.5 text-sm font-medium"
            style={{
              color: isSelected && !selectedSectionId ? '#FFFFFF' : 'var(--color-sidebar-text)',
            }}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: book.color }}
            />
            <span className="truncate">{book.name}</span>
          </button>

          {book.pendingCount > 0 && (
            <span className="shrink-0 rounded-full px-1.5 py-0.5 text-xs" style={{ backgroundColor: 'var(--color-sidebar-hover)', color: 'var(--color-sidebar-text)' }}>
              {book.pendingCount}
            </span>
          )}

          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={(e) => { e.stopPropagation(); setShowNewSection(true) }}
              className="rounded p-1 transition-colors"
              style={{ color: 'var(--color-sidebar-text)', backgroundColor: 'var(--color-sidebar-hover)' }}
              aria-label="Add section"
            >
              <PlusIcon />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowEdit(true) }}
              className="rounded p-1 transition-colors"
              style={{ color: 'var(--color-sidebar-text)', backgroundColor: 'var(--color-sidebar-hover)' }}
              aria-label="Edit book"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Delete \"${book.name}\" and all its tasks?`)) deleteBook(book.id)
              }}
              className="rounded p-1 transition-colors"
              style={{
                color: 'var(--color-dismiss-text)',
                backgroundColor: 'var(--color-dismiss-bg)',
              }}
              aria-label="Delete book"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.559a.75.75 0 1 0-1.492.149l.66 6.6A1.75 1.75 0 0 0 5.405 15h5.19a1.75 1.75 0 0 0 1.74-1.692l.661-6.6a.75.75 0 0 0-1.492-.149l-.66 6.6a.25.25 0 0 1-.249.241h-5.19a.25.25 0 0 1-.249-.241ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
              </svg>
            </button>
          </div>
        </div>

        {expanded && hasSections && (
          <div className="ml-6 mt-0.5 flex flex-col gap-0.5 pl-2" style={{ borderLeft: `1px solid var(--color-sidebar-border)` }}>
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

export default function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const [showNewBook, setShowNewBook] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { theme } = useTheme()

  const books = useAppStore((s) => s.books)
  const sections = useAppStore((s) => s.sections)
  const selectedBookId = useAppStore((s) => s.selectedBookId)
  const selectedSectionId = useAppStore((s) => s.selectedSectionId)
  const selectBook = useAppStore((s) => s.selectBook)
  const selectSection = useAppStore((s) => s.selectSection)

  const totalPending = books.reduce((sum, b) => sum + b.pendingCount, 0)

  return (
    <aside
      className="flex h-full shrink-0 flex-col transition-all duration-300"
      style={{ width: collapsed ? '4.5rem' : '15rem', backgroundColor: 'var(--color-sidebar-bg)' }}
    >
      {/* Header — click logo to toggle collapse */}
      <div
        className="flex items-center border-b px-2 py-2"
        style={{ borderColor: 'var(--color-sidebar-border)', minHeight: '80px' }}
      >
        <button
          onClick={() => setCollapsed(v => !v)}
          className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl hover:opacity-75 transition-opacity"
          style={{ width: collapsed ? 52 : 64, height: collapsed ? 52 : 64 }}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <Image
            src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
            alt="Folio"
            width={collapsed ? 48 : 60}
            height={collapsed ? 48 : 60}
            className="object-contain"
          />
        </button>

        {!collapsed && (
          <div className="ml-2 flex-1 min-w-0">
            {totalPending > 0 ? (
              <>
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-sidebar-accent)' }}>
                  {totalPending} {pluralize(totalPending, 'tarea', 'tareas')} pendiente
                </p>
                <p className="text-xs opacity-50 truncate" style={{ color: 'var(--color-sidebar-text)' }}>
                  ¡Sigue así!
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-sidebar-text)' }}>
                  Todo al día ✓
                </p>
                <p className="text-xs opacity-50 truncate" style={{ color: 'var(--color-sidebar-text)' }}>
                  Sin pendientes
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 pt-3">
        {collapsed ? (
          // Colapsado: punto de color con badge y tooltip
          books.map((book) => (
            <div key={book.id} className="group relative">
              <button
                onClick={() => { selectBook(book.id); onNavigate?.() }}
                title={book.name}
                className="flex w-full items-center justify-center rounded-md py-3 transition-colors"
                style={{ backgroundColor: selectedBookId === book.id ? 'var(--color-sidebar-accent)' : 'transparent' }}
              >
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: book.color }}
                />
                {book.pendingCount > 0 && (
                  <span
                    className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
                    style={{ backgroundColor: 'var(--color-priority-high)' }}
                  />
                )}
              </button>
            </div>
          ))
        ) : books.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs opacity-60" style={{ color: 'var(--color-sidebar-text)' }}>
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
                onSelectBook={() => { selectBook(book.id); onNavigate?.() }}
                onSelectSection={(id) => { selectSection(id); onNavigate?.() }}
              />
            )
          })
        )}
      </nav>

      {/* Footer */}
      <div className="border-t p-2" style={{ borderColor: 'var(--color-sidebar-border)' }}>
        <ThemeToggle collapsed={collapsed} />
        <button
          onClick={() => setShowNewBook(true)}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-medium transition-colors"
          style={{ color: 'var(--color-sidebar-text)', background: 'var(--color-sidebar-hover)' }}
          title="Nuevo libro"
        >
          <Plus size={16} className="shrink-0" />
          {!collapsed && 'Nuevo libro'}
        </button>
        {!collapsed && (
          <p className="mt-2 text-center text-xs opacity-40" style={{ color: 'var(--color-sidebar-text)' }}>{APP_DOMAIN}</p>
        )}
      </div>

      <BookForm open={showNewBook} onClose={() => setShowNewBook(false)} />
    </aside>
  )
}
