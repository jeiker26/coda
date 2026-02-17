import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { Settings, RepoConfig, defaultSettings } from './settings.types'

const RUNNER_URL = 'http://localhost:3847'

interface SettingsState extends Settings {
  setApiKey: (key: 'openaiApiKey' | 'anthropicApiKey' | 'githubToken' | 'slackWebhookUrl', value: string) => void
  setOpenaiBaseUrl: (url: string) => void
  setAnthropicBaseUrl: (url: string) => void
  setPreferredProvider: (provider: 'openai' | 'anthropic') => void
  addRepo: (repo: RepoConfig) => void
  removeRepo: (path: string) => void
  updateRepo: (path: string, updates: Partial<RepoConfig>) => void
  setMaxChangedFiles: (n: number) => void
  setMaxDiffSize: (n: number) => void
  setAutoRetry: (v: boolean) => void
  setSkipTestsByDefault: (v: boolean) => void
}

// Sync settings to runner
const syncToRunner = async (settings: Partial<Settings>) => {
  try {
    await fetch(`${RUNNER_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
  } catch (e) {
    console.warn('Failed to sync settings to runner:', e)
  }
}

export const useSettingsStore = create<SettingsState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        ...defaultSettings,
        setApiKey: (key, value) => {
          set({ [key]: value })
          syncToRunner({ [key]: value })
        },
        setOpenaiBaseUrl: (url) => {
          set({ openaiBaseUrl: url })
          syncToRunner({ openaiBaseUrl: url })
        },
        setAnthropicBaseUrl: (url) => {
          set({ anthropicBaseUrl: url })
          syncToRunner({ anthropicBaseUrl: url })
        },
        setPreferredProvider: (provider) => {
          set({ preferredProvider: provider })
          syncToRunner({ preferredProvider: provider })
        },
        addRepo: (repo) => set((s) => ({ repos: [...s.repos, repo] })),
        removeRepo: (path) => set((s) => ({ repos: s.repos.filter((r) => r.path !== path) })),
        updateRepo: (path, updates) =>
          set((s) => ({
            repos: s.repos.map((r) => (r.path === path ? { ...r, ...updates } : r)),
          })),
        setMaxChangedFiles: (n) => {
          set({ maxChangedFiles: n })
          syncToRunner({ maxChangedFiles: n })
        },
        setMaxDiffSize: (n) => {
          set({ maxDiffSize: n })
          syncToRunner({ maxDiffSize: n })
        },
        setAutoRetry: (v) => {
          set({ autoRetry: v })
          syncToRunner({ autoRetry: v })
        },
        setSkipTestsByDefault: (v) => {
          set({ skipTestsByDefault: v })
          syncToRunner({ skipTestsByDefault: v })
        },
      }),
      {
        name: 'mac-agent-settings',
        onRehydrateStorage: () => (state) => {
          // Sync all settings to runner when app starts
          if (state) {
            syncToRunner({
              openaiApiKey: state.openaiApiKey,
              openaiBaseUrl: state.openaiBaseUrl,
              anthropicApiKey: state.anthropicApiKey,
              anthropicBaseUrl: state.anthropicBaseUrl,
              preferredProvider: state.preferredProvider,
              githubToken: state.githubToken,
              slackWebhookUrl: state.slackWebhookUrl,
              maxChangedFiles: state.maxChangedFiles,
              maxDiffSize: state.maxDiffSize,
              autoRetry: state.autoRetry,
              skipTestsByDefault: state.skipTestsByDefault,
            })
          }
        },
      }
    )
  )
)
