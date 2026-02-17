export interface Task {
  id: string
  name: string
  prompt: string
  repo: string
  skipTests: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTaskInput {
  name: string
  prompt: string
  repo: string
  skipTests?: boolean
}
