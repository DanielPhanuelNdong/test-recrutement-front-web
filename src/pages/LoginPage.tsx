import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import Logo from '../components/Logo'
import PasswordInput from '../components/PasswordInput'
import { login } from '../features/auth/authSlice'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const status = useAppSelector((state) => state.auth.status)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    try {
      await dispatch(login({ email, password })).unwrap()
      navigate('/tasks')
    } catch (error) {
      toast.error((error as string) ?? 'Échec de la connexion')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo size={48} />
          <div className="text-center">
            <h1 className="text-xl font-semibold text-slate-900">Content de vous revoir</h1>
            <p className="mt-1 text-sm text-slate-500">Connectez-vous pour gérer vos tâches</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'loading' ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Pas de compte ?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
