import { useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import Navbar from '../components/Navbar'
import TaskFilters from '../components/TaskFilters'
import TaskForm from '../components/TaskForm'
import TaskItem from '../components/TaskItem'
import { ClipboardListIcon } from '../components/icons'
import { createTask, fetchTasks, setSearch, setStatusFilter } from '../features/tasks/tasksSlice'
import type { TaskRequest } from '../types'

export default function TasksPage() {
  const dispatch = useAppDispatch()
  const { items, status, error, statusFilter, search } = useAppSelector((state) => state.tasks)

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(
        fetchTasks({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          search: search || undefined,
        }),
      )
    }, 300)
    return () => clearTimeout(timeout)
  }, [dispatch, statusFilter, search])

  const stats = useMemo(
    () => ({
      total: items.length,
      todo: items.filter((task) => task.status === 'TODO').length,
      inProgress: items.filter((task) => task.status === 'IN_PROGRESS').length,
      done: items.filter((task) => task.status === 'DONE').length,
    }),
    [items],
  )

  async function handleCreate(payload: TaskRequest) {
    try {
      await dispatch(createTask(payload)).unwrap()
      toast.success('Tâche créée')
    } catch (creationError) {
      toast.error((creationError as string) ?? 'Échec de la création')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Mes tâches</h1>
          <p className="mt-1 text-sm text-slate-500">Suivez et organisez votre travail au quotidien.</p>
        </div>

        {stats.total > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total" value={stats.total} accent="text-slate-900" />
            <StatCard label="À faire" value={stats.todo} accent="text-slate-600" dot="bg-slate-400" />
            <StatCard label="En cours" value={stats.inProgress} accent="text-amber-600" dot="bg-amber-400" />
            <StatCard label="Terminé" value={stats.done} accent="text-emerald-600" dot="bg-emerald-400" />
          </div>
        )}

        <TaskForm submitLabel="Ajouter la tâche" onSubmit={handleCreate} />

        <TaskFilters
          statusFilter={statusFilter}
          search={search}
          onStatusChange={(value) => dispatch(setStatusFilter(value))}
          onSearchChange={(value) => dispatch(setSearch(value))}
        />

        {status === 'loading' && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
            ))}
          </div>
        )}

        {status === 'failed' && error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {status === 'idle' && items.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
              <ClipboardListIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Aucune tâche pour le moment</p>
              <p className="mt-0.5 text-sm text-slate-500">Ajoutez votre première tâche ci-dessus.</p>
            </div>
          </div>
        )}

        {status !== 'loading' && items.length > 0 && (
          <div className="flex flex-col gap-3">
            {items.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
  dot,
}: {
  label: string
  value: number
  accent: string
  dot?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
        {label}
      </div>
      <p className={`mt-1 text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  )
}
