export interface RepoConfig {
  path: string
  name: string
  testCommand?: string
  forbiddenPaths?: string[]
}

export interface Settings {
  openaiApiKey?: string
  openaiBaseUrl?: string
  anthropicApiKey?: string
  anthropicBaseUrl?: string
  preferredProvider: 'openai' | 'anthropic'
  githubToken?: string
  slackWebhookUrl?: string
  repos: RepoConfig[]
  maxChangedFiles: number
  maxDiffSize: number
  autoRetry: boolean
  skipTestsByDefault: boolean
}

export const defaultSettings: Settings = {
  repos: [],
  maxChangedFiles: 10,
  maxDiffSize: 5000,
  autoRetry: true,
  skipTestsByDefault: true,
  preferredProvider: 'anthropic',
}
