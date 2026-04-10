'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import type { Task, TaskPriority } from '@/lib/types'

interface TaskFormProps {
  open: boolean
  onClose: () => void
  bookId: string
  sectionId?: string | null
  task?: Task
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Bajo' },
  { value: 'medium', label: 'Medio' },
  { value: 'high', label: 'Alto' },
]

export default function TaskForm({ open, onClose, bookId, sectionId, task }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const createTask = useAppStore((s) => s.createTask)
  const updateTask = useAppStore((s) => s.updateTask)

  const isEditing = Boolean(task)

  const handleClose = () => {
    if (!isEditing) {
      setTitle('')
      setDescription('')
      setPriority('medium')
    } else {
      setTitle(task!.title)
      setDescription(task!.description ?? '')
      setPriority(task!.priority)
    }
    setError('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('El título es obligatorio'); return }
    setLoading(true)
    try {
      if (isEditing && task) {
        await updateTask(task.id, {
          title: title.trim(),
          description: description.trim() || null,
          priority,
        })
      } else {
        await createTask({
          bookId,
          sectionId: sectionId ?? null,
          title: title.trim(),
          description: description.trim() || null,
          priority,
        })
      }
      handleClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={isEditing ? 'Editar tarea' : 'Nueva tarea'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="task-title"
          label="Título"
          placeholder="¿Qué necesita hacerse?"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError('') }}
          error={error}
          autoFocus
        />
        <Textarea
          id="task-description"
          label="Descripción (opcional)"
          placeholder="Agregar más detalles..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-700">Prioridad</span>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={`flex-1 rounded-md border py-1.5 text-xs font-medium transition-colors ${
                  priority === p.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear tarea'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
