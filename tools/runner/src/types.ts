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
  dryRun: boolean
  skipTests: boolean
  retryCount: number
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

export interface Settings {
  openaiApiKey?: string
  openaiBaseUrl?: string
  anthropicApiKey?: string
  anthropicBaseUrl?: string
  preferredProvider?: 'openai' | 'anthropic'
  githubToken?: string
  slackWebhookUrl?: string
  maxChangedFiles: number
  maxDiffSize: number
  autoRetry: boolean
  skipTestsByDefault: boolean
}

export interface CodePatch {
  filePath: string
  content: string
  operation: 'create' | 'modify' | 'delete'
}

export interface AIResponse {
  patches: CodePatch[]
  explanation: string
  testCommands?: string[]
}
