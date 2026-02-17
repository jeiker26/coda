import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSettingsStore } from '@features/settings'
import { useSkillsStore } from '@features/skills/model/skills.store'
import { runnerApi } from '@features/jobs/api/jobs.api'
import { CreateJobRequest } from '@features/jobs'

type Mode = 'run' | 'draft' | 'test'

export function TaskComposer() {
  const [task, setTask] = useState('')
  const [selectedRepo, setSelectedRepo] = useState('')
  const [baseBranch, setBaseBranch] = useState('')
  const [mode, setMode] = useState<Mode>('run')
  const [skipTests, setSkipTests] = useState(true)
  const { repos, skipTestsByDefault } = useSettingsStore()
  const { getSkillsForRepo } = useSkillsStore()
  const queryClient = useQueryClient()

  // Initialize skipTests from settings default
  useState(() => {
    setSkipTests(skipTestsByDefault)
  })

  const createJobMutation = useMutation({
    mutationFn: (req: CreateJobRequest) => runnerApi.create(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      setTask('')
      setBaseBranch('')
    },
  })

  const handleSubmit = () => {
    if (!task.trim() || !selectedRepo) return
    
    // Get skills assigned to the selected repo
    const repoSkills = getSkillsForRepo(selectedRepo)
    const skillsPayload = repoSkills.map(skill => ({
      name: skill.name,
      content: skill.content,
    }))

    createJobMutation.mutate({
      task: task.trim(),
      repo: selectedRepo,
      baseBranch: baseBranch.trim() || undefined,
      dryRun: mode === 'draft',
      skipTests,
      skills: skillsPayload,
    })
  }

  return (
    <div className="space-y-4">
      {/* Task Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Task Description</label>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-blue-500 outline-none resize-none"
          placeholder="Describe what you want the agent to do..."
          rows={4}
        />
      </div>

      {/* Repo Selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Repository</label>
        <select
          value={selectedRepo}
          onChange={(e) => setSelectedRepo(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-blue-500 outline-none"
        >
          <option value="">Select a repository...</option>
          {repos.map((repo) => (
            <option key={repo.path} value={repo.path}>
              {repo.name}
            </option>
          ))}
        </select>
        {repos.length === 0 && (
          <p className="text-xs text-yellow-500 mt-1">
            No repositories configured. Go to Settings to add repos.
          </p>
        )}
      </div>

      {/* Base Branch */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Base Branch <span className="text-gray-500">(optional)</span>
        </label>
        <input
          type="text"
          value={baseBranch}
          onChange={(e) => setBaseBranch(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-blue-500 outline-none"
          placeholder="main (auto-detected if empty)"
        />
        <p className="text-xs text-gray-500 mt-1">
          Branch to create from. Defaults to main/master if empty.
        </p>
      </div>

      {/* Mode Selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Mode</label>
        <div className="flex gap-2">
          {(['run', 'draft', 'test'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                mode === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {m === 'run' && 'Run (Full)'}
              {m === 'draft' && 'Draft (Dry Run)'}
              {m === 'test' && 'Test Only'}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {mode === 'run' && 'Creates branch, applies changes, runs tests, opens PR'}
          {mode === 'draft' && 'Generates code but does not push or create PR'}
          {mode === 'test' && 'Runs tests on existing changes'}
        </p>
      </div>

      {/* Skip Tests */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="skipTests"
          checked={skipTests}
          onChange={(e) => setSkipTests(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="skipTests" className="text-sm text-gray-400">Skip tests</label>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!task.trim() || !selectedRepo || createJobMutation.isPending}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          !task.trim() || !selectedRepo || createJobMutation.isPending
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-500 text-white'
        }`}
      >
        {createJobMutation.isPending ? 'Creating Job...' : 'Create Job'}
      </button>

      {createJobMutation.error && (
        <p className="text-red-400 text-sm">
          Error: {(createJobMutation.error as Error).message}
        </p>
      )}
    </div>
  )
}
