export interface Task {
  id: string
  name: string
  prompt: string
  repo: string
  baseBranch?: string  // Base branch to create from (defaults to main/master)
  skipTests: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTaskInput {
  name: string
  prompt: string
  repo: string
  baseBranch?: string
  skipTests?: boolean
}
