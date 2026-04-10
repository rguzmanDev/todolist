'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import type { Section } from '@/lib/types'

interface SectionFormProps {
  open: boolean
  onClose: () => void
  bookId: string
  section?: Section
}

export default function SectionForm({ open, onClose, bookId, section }: SectionFormProps) {
  const [name, setName] = useState(section?.name ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const createSection = useAppStore((s) => s.createSection)
  const updateSection = useAppStore((s) => s.updateSection)

  const isEditing = Boolean(section)

  const handleClose = () => {
    setName(section?.name ?? '')
    setError('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('El nombre es obligatorio'); return }
    setLoading(true)
    try {
      if (isEditing && section) {
        await updateSection(bookId, section.id, { name: name.trim() })
      } else {
        await createSection(bookId, { name: name.trim() })
      }
      handleClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={isEditing ? 'Editar sección' : 'Nueva sección'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="section-name"
          label="Nombre"
          placeholder="ej. API Backend, Sprint 23"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          error={error}
          autoFocus
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear sección'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
