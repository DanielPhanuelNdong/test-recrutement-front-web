import type { TaskStatus } from '../types'

const STATUS_OPTIONS: Array<{ value: TaskStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Tous les statuts' },
  { value: 'TODO', label: 'À faire' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'DONE', label: 'Terminé' },
]

interface Props {
  statusFilter: TaskStatus | 'ALL'
  search: string
  onStatusChange: (status: TaskStatus | 'ALL') => void
  onSearchChange: (search: string) => void
}

export default function TaskFilters({ statusFilter, search, onStatusChange, onSearchChange }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="search"
        placeholder="Rechercher une tâche..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none sm:max-w-xs"
      />
      <select
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value as TaskStatus | 'ALL')}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
