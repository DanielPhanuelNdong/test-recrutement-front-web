import { useState, type FormEvent } from 'react'
import type { Task, TaskRequest, TaskStatus } from '../types'

const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: 'TODO', label: 'À faire' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'DONE', label: 'Terminé' },
]

interface Props {
  initialTask?: Task
  submitLabel: string
  onSubmit: (payload: TaskRequest) => Promise<void>
  onCancel?: () => void
}

export default function TaskForm({ initialTask, submitLabel, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initialTask?.title ?? '')
  const [description, setDescription] = useState(initialTask?.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status ?? 'TODO')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), status })
      if (!initialTask) {
        setTitle('')
        setDescription('')
        setStatus('TODO')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <input
        type="text"
        placeholder="Titre de la tâche"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
        maxLength={200}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <textarea
        placeholder="Description (optionnelle)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        maxLength={2000}
        rows={2}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <div className="flex items-center gap-3">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as TaskStatus)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? '...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}
