import { useState, type FormEvent } from 'react'
import type { Task, TaskRequest, TaskStatus } from '../types'
import { PlusIcon } from './icons'

const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string; dot: string }> = [
  { value: 'TODO', label: 'À faire', dot: 'bg-slate-400' },
  { value: 'IN_PROGRESS', label: 'En cours', dot: 'bg-amber-500' },
  { value: 'DONE', label: 'Terminé', dot: 'bg-emerald-500' },
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
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-4 rounded-xl border bg-white p-5 ${
        initialTask ? 'border-indigo-200 shadow-sm ring-1 ring-indigo-100' : 'border-slate-200 shadow-sm'
      }`}
    >
      {!initialTask && <h2 className="text-sm font-semibold text-slate-900">Nouvelle tâche</h2>}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Titre de la tâche"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          maxLength={200}
          className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
        />
        <textarea
          placeholder="Description (optionnelle)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={2000}
          rows={2}
          className="resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                status === option.value
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${option.dot}`} />
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {!initialTask && !submitting && <PlusIcon className="h-4 w-4" />}
            {submitting ? '...' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
