import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Task, CreateTaskInput } from './tasks.types'
import { v4 as uuid } from 'uuid'

interface TasksState {
  tasks: Task[]
  addTask: (input: CreateTaskInput) => Task
  updateTask: (id: string, updates: Partial<CreateTaskInput>) => void
  deleteTask: (id: string) => void
  getTask: (id: string) => Task | undefined
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (input) => {
        const now = new Date().toISOString()
        const task: Task = {
          id: uuid(),
          name: input.name,
          prompt: input.prompt,
          repo: input.repo,
          skipTests: input.skipTests ?? false,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ tasks: [task, ...state.tasks] }))
        return task
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        }))
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }))
      },

      getTask: (id) => {
        return get().tasks.find((task) => task.id === id)
      },
    }),
    {
      name: 'mac-agent-tasks',
    }
  )
)
