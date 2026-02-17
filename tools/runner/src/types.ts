export interface Job {
  id: string
  task: string
  repo: string
  branch: string
  baseBranch?: string     // Base branch to create from (defaults to main/master)
  status: JobStatus
  prUrl?: string
  error?: string
  logs: string[]
  createdAt: string
  updatedAt: string
  dryRun: boolean
  skipTests: boolean
  retryCount: number
  skills?: SkillContext[]  // Skills to apply
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
  baseBranch?: string     // Base branch to create from (defaults to main/master)
  dryRun?: boolean
  skipTests?: boolean
  skills?: SkillContext[]
}

export interface Settings {
  openaiApiKey?: string
  openaiBaseUrl?: string
  anthropicApiKey?: string
  anthropicBaseUrl?: string
  preferredProvider?: 'openai' | 'anthropic'
  githubToken?: string
  slackWebhookUrl?: string
  slackAppToken?: string    // xapp-... for Socket Mode
  slackBotToken?: string    // xoxb-... for Socket Mode
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
