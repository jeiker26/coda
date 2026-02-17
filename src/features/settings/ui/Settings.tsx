import { useState, useEffect } from 'react'
import { useSettingsStore } from '../model/settings.store'

const RUNNER_URL = 'http://localhost:3847'

interface AvailableRepo {
  name: string
  path: string
}

interface RunnerStatus {
  openaiApiKey: string
  anthropicApiKey: string
  preferredProvider: string
  [key: string]: string | number | boolean
}

export function Settings() {
  const settings = useSettingsStore()
  const [newRepoPath, setNewRepoPath] = useState('')
  const [availableRepos, setAvailableRepos] = useState<AvailableRepo[]>([])
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)
  const [runnerStatus, setRunnerStatus] = useState<RunnerStatus | null>(null)
  const [syncMessage, setSyncMessage] = useState('')

  // Fetch runner status
  const loadRunnerStatus = async () => {
    try {
      const res = await fetch(`${RUNNER_URL}/settings`)
      if (res.ok) {
        setRunnerStatus(await res.json())
      }
    } catch (e) {
      setRunnerStatus(null)
    }
  }

  // Force sync all settings to runner
  const syncAllSettings = async () => {
    setSyncMessage('Syncing...')
    try {
      const res = await fetch(`${RUNNER_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openaiApiKey: settings.openaiApiKey,
          openaiBaseUrl: settings.openaiBaseUrl,
          anthropicApiKey: settings.anthropicApiKey,
          anthropicBaseUrl: settings.anthropicBaseUrl,
          preferredProvider: settings.preferredProvider,
          githubToken: settings.githubToken,
          slackWebhookUrl: settings.slackWebhookUrl,
          maxChangedFiles: settings.maxChangedFiles,
          maxDiffSize: settings.maxDiffSize,
          autoRetry: settings.autoRetry,
        }),
      })
      if (res.ok) {
        setSyncMessage('Synced!')
        loadRunnerStatus()
      } else {
        setSyncMessage('Sync failed')
      }
    } catch (e) {
      setSyncMessage('Runner not available')
    }
    setTimeout(() => setSyncMessage(''), 2000)
  }

  // Fetch available repos from runner
  const loadRepos = async () => {
    setIsLoadingRepos(true)
    try {
      const res = await fetch(`${RUNNER_URL}/repos`)
      if (res.ok) {
        const repos = await res.json()
        setAvailableRepos(repos)
      }
    } catch (e) {
      console.error('Failed to load repos:', e)
    } finally {
      setIsLoadingRepos(false)
    }
  }

  useEffect(() => {
    loadRepos()
    loadRunnerStatus()
  }, [])

  const handleAddRepo = () => {
    if (newRepoPath && !settings.repos.find((r) => r.path === newRepoPath)) {
      settings.addRepo({
        path: newRepoPath,
        name: newRepoPath.split('/').pop() || newRepoPath,
      })
      setNewRepoPath('')
    }
  }

  const handleAddFromAvailable = (repo: AvailableRepo) => {
    if (!settings.repos.find((r) => r.path === repo.path)) {
      settings.addRepo(repo)
    }
  }

  return (
    <div className="space-y-6">
      {/* Runner Status & Sync */}
      <section className="p-3 bg-white/5 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-400">Runner Status</h2>
          <div className="flex items-center gap-2">
            {syncMessage && <span className="text-xs text-green-400">{syncMessage}</span>}
            <button
              onClick={syncAllSettings}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded"
            >
              Sync to Runner
            </button>
          </div>
        </div>
        {runnerStatus ? (
          <div className="text-xs text-gray-500 flex gap-4 flex-wrap">
            <span>Anthropic: <span className={runnerStatus.anthropicApiKey === 'configured' ? 'text-green-400' : 'text-red-400'}>{runnerStatus.anthropicApiKey}</span></span>
            <span>OpenAI: <span className={runnerStatus.openaiApiKey === 'configured' ? 'text-green-400' : 'text-red-400'}>{runnerStatus.openaiApiKey}</span></span>
            <span>Provider: <span className="text-blue-400">{runnerStatus.preferredProvider}</span></span>
          </div>
        ) : (
          <div className="text-xs text-red-400">Runner not connected</div>
        )}
      </section>

      {/* AI Provider Selection */}
      <section>
        <h2 className="text-lg font-semibold mb-3">AI Provider</h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => settings.setPreferredProvider('anthropic')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
              settings.preferredProvider === 'anthropic'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            Anthropic (Claude)
          </button>
          <button
            onClick={() => settings.setPreferredProvider('openai')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
              settings.preferredProvider === 'openai'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            OpenAI
          </button>
        </div>

        {/* Anthropic Settings */}
        <div className={`space-y-3 p-3 rounded-lg ${settings.preferredProvider === 'anthropic' ? 'bg-blue-600/10 border border-blue-500/30' : 'bg-white/5'}`}>
          <h3 className="text-sm font-medium text-gray-300">Anthropic</h3>
          <div>
            <label className="block text-sm text-gray-400 mb-1">API Key</label>
            <input
              type="password"
              value={settings.anthropicApiKey || ''}
              onChange={(e) => settings.setApiKey('anthropicApiKey', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
              placeholder="sk-ant-..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Base URL (Gateway)</label>
            <input
              type="text"
              value={settings.anthropicBaseUrl || ''}
              onChange={(e) => settings.setAnthropicBaseUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
              placeholder="https://api.anthropic.com (default)"
            />
          </div>
        </div>

        {/* OpenAI Settings */}
        <div className={`space-y-3 p-3 rounded-lg mt-3 ${settings.preferredProvider === 'openai' ? 'bg-blue-600/10 border border-blue-500/30' : 'bg-white/5'}`}>
          <h3 className="text-sm font-medium text-gray-300">OpenAI</h3>
          <div>
            <label className="block text-sm text-gray-400 mb-1">API Key</label>
            <input
              type="password"
              value={settings.openaiApiKey || ''}
              onChange={(e) => settings.setApiKey('openaiApiKey', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
              placeholder="sk-..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Base URL (Gateway)</label>
            <input
              type="text"
              value={settings.openaiBaseUrl || ''}
              onChange={(e) => settings.setOpenaiBaseUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
              placeholder="https://api.openai.com/v1 (default)"
            />
          </div>
        </div>
      </section>

      {/* GitHub & Slack */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Integrations</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">GitHub Token</label>
            <input
              type="password"
              value={settings.githubToken || ''}
              onChange={(e) => settings.setApiKey('githubToken', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
              placeholder="ghp_..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Slack Webhook URL</label>
            <input
              type="text"
              value={settings.slackWebhookUrl || ''}
              onChange={(e) => settings.setApiKey('slackWebhookUrl', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
              placeholder="https://hooks.slack.com/..."
            />
          </div>
        </div>
      </section>

      {/* Repositories */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Repositories</h2>
        
        {/* Available repos from WebstormProjects */}
        {availableRepos.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              Available Git repos (click to add):
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-auto">
              {availableRepos.map((repo) => {
                const isAdded = settings.repos.some((r) => r.path === repo.path)
                return (
                  <button
                    key={repo.path}
                    onClick={() => handleAddFromAvailable(repo)}
                    disabled={isAdded}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      isAdded
                        ? 'bg-green-600/30 text-green-400 cursor-default'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {repo.name} {isAdded && ''}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {isLoadingRepos && (
          <p className="text-gray-500 text-sm mb-3">Loading repos...</p>
        )}
        
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newRepoPath}
            onChange={(e) => setNewRepoPath(e.target.value)}
            className="flex-1 px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
            placeholder="Or enter custom path..."
          />
          <button
            onClick={handleAddRepo}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
          >
            Add
          </button>
        </div>

        {/* Configured repos */}
        <div className="space-y-2">
          <label className="block text-sm text-gray-400 mb-1">Configured repos:</label>
          {settings.repos.map((repo) => (
            <div
              key={repo.path}
              className="flex items-center justify-between p-3 bg-white/5 rounded"
            >
              <div>
                <div className="font-medium">{repo.name}</div>
                <div className="text-sm text-gray-400 truncate max-w-[250px]">{repo.path}</div>
              </div>
              <button
                onClick={() => settings.removeRepo(repo.path)}
                className="px-2 py-1 text-sm text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
          {settings.repos.length === 0 && (
            <p className="text-gray-500 text-sm">No repositories configured. Add repos above.</p>
          )}
        </div>
      </section>

      {/* Guardrails */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Guardrails</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Max Changed Files</label>
            <input
              type="number"
              value={settings.maxChangedFiles}
              onChange={(e) => settings.setMaxChangedFiles(parseInt(e.target.value) || 10)}
              className="w-20 px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Max Diff Size (lines)</label>
            <input
              type="number"
              value={settings.maxDiffSize}
              onChange={(e) => settings.setMaxDiffSize(parseInt(e.target.value) || 5000)}
              className="w-24 px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRetry"
              checked={settings.autoRetry}
              onChange={(e) => settings.setAutoRetry(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="autoRetry" className="text-sm">Auto-retry failed jobs (once)</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="skipTests"
              checked={settings.skipTestsByDefault}
              onChange={(e) => settings.setSkipTestsByDefault(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="skipTests" className="text-sm">Skip tests by default</label>
          </div>
        </div>
      </section>
    </div>
  )
}
