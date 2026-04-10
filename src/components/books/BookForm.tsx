'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ColorPicker from '@/components/ui/ColorPicker'
import { useAppStore } from '@/lib/store'
import { DEFAULT_BOOK_COLOR } from '@/lib/constants'
import type { BookColor } from '@/lib/constants'
import type { Book } from '@/lib/types'

interface BookFormProps {
  open: boolean
  onClose: () => void
  book?: Book
}

export default function BookForm({ open, onClose, book }: BookFormProps) {
  const [name, setName] = useState(book?.name ?? '')
  const [color, setColor] = useState<string>(book?.color ?? DEFAULT_BOOK_COLOR)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const createBook = useAppStore((s) => s.createBook)
  const updateBook = useAppStore((s) => s.updateBook)

  const isEditing = Boolean(book)

  const handleClose = () => {
    setName(book?.name ?? '')
    setColor(book?.color ?? DEFAULT_BOOK_COLOR)
    setError('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('El nombre es obligatorio'); return }
    setLoading(true)
    try {
      if (isEditing && book) {
        await updateBook(book.id, { name: name.trim(), color })
      } else {
        await createBook({ name: name.trim(), color })
      }
      handleClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={isEditing ? 'Editar Libro' : 'Nuevo Libro'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="book-name"
          label="Nombre"
          placeholder="ej. Trabajo, Estudios, Personal"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          error={error}
          autoFocus
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>Color</span>
          <ColorPicker value={color} onChange={(c: BookColor) => setColor(c)} />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear libro'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
