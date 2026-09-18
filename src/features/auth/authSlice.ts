import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import apiClient, { TOKEN_STORAGE_KEY } from '../../api/client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../../types'

const USER_STORAGE_KEY = 'task_manager_user'

export interface AuthUser {
  userId: number
  email: string
  fullName: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function persistAuth(response: AuthResponse) {
  localStorage.setItem(TOKEN_STORAGE_KEY, response.token)
  const user: AuthUser = {
    userId: response.userId,
    email: response.email,
    fullName: response.fullName,
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  return user
}

const initialState: AuthState = {
  token: localStorage.getItem(TOKEN_STORAGE_KEY),
  user: readStoredUser(),
  status: 'idle',
  error: null,
}

export const register = createAsyncThunk<AuthResponse, RegisterRequest, { rejectValue: string }>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<AuthResponse>('/api/auth/register', payload)
      return data
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const login = createAsyncThunk<AuthResponse, LoginRequest, { rejectValue: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<AuthResponse>('/api/auth/login', payload)
      return data
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem(USER_STORAGE_KEY)
      state.token = null
      state.user = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.status = 'idle'
        state.token = action.payload.token
        state.user = persistAuth(action.payload)
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? "Échec de l'inscription"
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.status = 'idle'
        state.token = action.payload.token
        state.user = persistAuth(action.payload)
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Échec de la connexion'
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
