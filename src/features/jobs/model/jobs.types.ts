export interface Job {
  id: string
  task: string
  repo: string
  branch: string
  status: JobStatus
  prUrl?: string
  error?: string
  logs: string[]
  createdAt: string
  updatedAt: string
  skipTests?: boolean
}

export type JobStatus = 
  | 'queued' 
  | 'coding' 
  | 'patching' 
  | 'testing' 
  | 'pr_opened' 
  | 'failed'
  | 'cancelled'

export interface CreateJobRequest {
  task: string
  repo: string
  dryRun?: boolean
  skipTests?: boolean
}
