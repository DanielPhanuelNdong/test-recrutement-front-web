import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../features/auth/authSlice'
import { resetTasks } from '../features/tasks/tasksSlice'

export default function Navbar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)

  function handleLogout() {
    dispatch(logout())
    dispatch(resetTasks())
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-900">Task Manager</h1>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-slate-600">{user.fullName}</span>}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  )
}
