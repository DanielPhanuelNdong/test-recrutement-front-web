import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAppDispatch } from '../app/hooks'
import { deleteTask, updateTask } from '../features/tasks/tasksSlice'
import type { Task, TaskRequest } from '../types'
import TaskForm from './TaskForm'

const STATUS_LABEL: Record<Task['status'], string> = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminé',
}

const STATUS_BADGE: Record<Task['status'], string> = {
  TODO: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  DONE: 'bg-green-100 text-green-700',
}

export default function TaskItem({ task }: { task: Task }) {
  const dispatch = useAppDispatch()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleUpdate(payload: TaskRequest) {
    try {
      await dispatch(updateTask({ id: task.id, payload })).unwrap()
      toast.success('Tâche mise à jour')
      setEditing(false)
    } catch (error) {
      toast.error((error as Error).message ?? 'Échec de la mise à jour')
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Supprimer la tâche "${task.title}" ?`)) return
    setDeleting(true)
    try {
      await dispatch(deleteTask(task.id)).unwrap()
      toast.success('Tâche supprimée')
    } catch (error) {
      toast.error((error as Error).message ?? 'Échec de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <TaskForm
        initialTask={task}
        submitLabel="Enregistrer"
        onSubmit={handleUpdate}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-slate-900">{task.title}</h3>
          {task.description && <p className="mt-1 text-sm text-slate-600">{task.description}</p>}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[task.status]}`}>
          {STATUS_LABEL[task.status]}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Modifier
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}
