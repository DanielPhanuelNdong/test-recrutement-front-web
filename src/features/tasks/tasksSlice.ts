import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import apiClient from '../../api/client'
import type { Task, TaskRequest, TaskStatus } from '../../types'

interface TasksState {
  items: Task[]
  status: 'idle' | 'loading' | 'failed'
  error: string | null
  statusFilter: TaskStatus | 'ALL'
  search: string
}

const initialState: TasksState = {
  items: [],
  status: 'idle',
  error: null,
  statusFilter: 'ALL',
  search: '',
}

export interface FetchTasksParams {
  status?: TaskStatus
  search?: string
}

export const fetchTasks = createAsyncThunk<Task[], FetchTasksParams | void, { rejectValue: string }>(
  'tasks/fetchTasks',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<Task[]>('/api/tasks', {
        params: {
          status: params?.status || undefined,
          search: params?.search || undefined,
        },
      })
      return data
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const createTask = createAsyncThunk<Task, TaskRequest, { rejectValue: string }>(
  'tasks/createTask',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<Task>('/api/tasks', payload)
      return data
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const updateTask = createAsyncThunk<
  Task,
  { id: number; payload: TaskRequest },
  { rejectValue: string }
>('tasks/updateTask', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.put<Task>(`/api/tasks/${id}`, payload)
    return data
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const deleteTask = createAsyncThunk<number, number, { rejectValue: string }>(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/tasks/${id}`)
      return id
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<TaskStatus | 'ALL'>) {
      state.statusFilter = action.payload
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
    resetTasks(state) {
      state.items = []
      state.status = 'idle'
      state.error = null
      state.statusFilter = 'ALL'
      state.search = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.status = 'idle'
        state.items = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Impossible de charger les tâches'
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const index = state.items.findIndex((task) => task.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((task) => task.id !== action.payload)
      })
  },
})

export const { setStatusFilter, setSearch, resetTasks } = tasksSlice.actions
export default tasksSlice.reducer
