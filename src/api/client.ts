import axios, { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../types'

export const TOKEN_STORAGE_KEY = 'task_manager_token'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem('task_manager_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    const message =
      error.response?.data?.message ??
      (error.response?.data?.fieldErrors
        ? Object.values(error.response.data.fieldErrors).join(', ')
        : null) ??
      error.message ??
      'Une erreur est survenue'
    return Promise.reject(new Error(message))
  },
)

export default apiClient
