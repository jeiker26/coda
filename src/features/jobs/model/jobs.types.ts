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
  skills?: SkillContext[]
}

export type JobStatus = 
  | 'queued' 
  | 'coding' 
  | 'patching' 
  | 'testing' 
  | 'pr_opened' 
  | 'failed'
  | 'cancelled'

export interface SkillContext {
  name: string
  content: string
}

export interface CreateJobRequest {
  task: string
  repo: string
  dryRun?: boolean
  skipTests?: boolean
  skills?: SkillContext[]
}
