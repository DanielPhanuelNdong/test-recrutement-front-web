import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAppDispatch } from '../app/hooks'
import { deleteTask, updateTask } from '../features/tasks/tasksSlice'
import type { Task, TaskRequest } from '../types'
import ConfirmDialog from './ConfirmDialog'
import { PencilIcon, TrashIcon } from './icons'
import TaskForm from './TaskForm'

const STATUS_LABEL: Record<Task['status'], string> = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminé',
}

const STATUS_BADGE: Record<Task['status'], string> = {
  TODO: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  DONE: 'bg-emerald-100 text-emerald-700',
}

const STATUS_BAR: Record<Task['status'], string> = {
  TODO: 'bg-slate-300',
  IN_PROGRESS: 'bg-amber-400',
  DONE: 'bg-emerald-400',
}

export default function TaskItem({ task }: { task: Task }) {
  const dispatch = useAppDispatch()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

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
    setDeleting(true)
    try {
      await dispatch(deleteTask(task.id)).unwrap()
      toast.success('Tâche supprimée')
      setConfirmOpen(false)
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
    <>
      <div className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 pl-5 shadow-sm transition hover:shadow-md">
        <span className={`absolute inset-y-0 left-0 w-1 ${STATUS_BAR[task.status]}`} />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-medium text-slate-900">{task.title}</h3>
            {task.description && (
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{task.description}</p>
            )}
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[task.status]}`}>
            {STATUS_LABEL[task.status]}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <PencilIcon className="h-3.5 w-3.5" />
            Modifier
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            Supprimer
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Supprimer cette tâche ?"
        message={`"${task.title}" sera définitivement supprimée. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
