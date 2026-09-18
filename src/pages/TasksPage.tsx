import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import Navbar from '../components/Navbar'
import TaskFilters from '../components/TaskFilters'
import TaskForm from '../components/TaskForm'
import TaskItem from '../components/TaskItem'
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
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
        <TaskForm submitLabel="Ajouter la tâche" onSubmit={handleCreate} />

        <TaskFilters
          statusFilter={statusFilter}
          search={search}
          onStatusChange={(value) => dispatch(setStatusFilter(value))}
          onSearchChange={(value) => dispatch(setSearch(value))}
        />

        {status === 'loading' && <p className="text-sm text-slate-500">Chargement...</p>}
        {status === 'failed' && error && <p className="text-sm text-red-600">{error}</p>}
        {status === 'idle' && items.length === 0 && (
          <p className="text-sm text-slate-500">Aucune tâche pour le moment.</p>
        )}

        <div className="flex flex-col gap-3">
          {items.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      </main>
    </div>
  )
}
