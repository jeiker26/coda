import { useState, useEffect } from 'react'
import { useTasksStore } from '../model/tasks.store'
import { useSkillsStore } from '../../skills/model/skills.store'
import { Task } from '../model/tasks.types'

const RUNNER_URL = 'http://localhost:3847'

interface AvailableRepo {
  name: string
  path: string
}

export function TasksList() {
  const { tasks, addTask, updateTask, deleteTask } = useTasksStore()
  const { getSkillsForRepo } = useSkillsStore()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [availableRepos, setAvailableRepos] = useState<AvailableRepo[]>([])
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [repo, setRepo] = useState('')
  const [baseBranch, setBaseBranch] = useState('')
  const [skipTests, setSkipTests] = useState(false)

  useEffect(() => {
    loadRepos()
  }, [])

  const loadRepos = async () => {
    try {
      const res = await fetch(`${RUNNER_URL}/repos`)
      if (res.ok) {
        setAvailableRepos(await res.json())
      }
    } catch (e) {
      console.error('Failed to load repos:', e)
    }
  }

  const resetForm = () => {
    setName('')
    setPrompt('')
    setRepo('')
    setBaseBranch('')
    setSkipTests(false)
    setIsCreating(false)
    setEditingId(null)
  }

  const handleSave = () => {
    if (!name.trim() || !prompt.trim() || !repo) return

    const taskData = { 
      name, 
      prompt, 
      repo, 
      baseBranch: baseBranch.trim() || undefined,
      skipTests 
    }

    if (editingId) {
      updateTask(editingId, taskData)
    } else {
      addTask(taskData)
    }
    resetForm()
  }

  const handleEdit = (task: Task) => {
    setEditingId(task.id)
    setName(task.name)
    setPrompt(task.prompt)
    setRepo(task.repo)
    setBaseBranch(task.baseBranch || '')
    setSkipTests(task.skipTests)
    setIsCreating(true)
  }

  const handleRun = async (task: Task) => {
    setRunningTaskId(task.id)
    try {
      // Get skills assigned to the repo
      const repoSkills = getSkillsForRepo(task.repo)
      const skillsPayload = repoSkills.map(skill => ({
        name: skill.name,
        content: skill.content,
      }))

      const res = await fetch(`${RUNNER_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: task.prompt,
          repo: task.repo,
          baseBranch: task.baseBranch || undefined,
          skipTests: task.skipTests,
          skills: skillsPayload,
        }),
      })
      if (res.ok) {
        const skillsMsg = skillsPayload.length > 0 
          ? ` with ${skillsPayload.length} skills` 
          : ''
        alert(`Job created${skillsMsg}! Check the Jobs tab.`)
      } else {
        const error = await res.json()
        alert(`Failed to create job: ${error.error}`)
      }
    } catch (e) {
      alert('Failed to connect to runner')
    } finally {
      setRunningTaskId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Predefined Tasks</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded"
          >
            + New Task
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="p-4 bg-white/5 rounded-lg space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Task Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
              placeholder="e.g., Fix ESLint errors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Repository</label>
            <select
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
            >
              <option value="">Select repository...</option>
              {availableRepos.map((r) => (
                <option key={r.path} value={r.path}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Base Branch <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              value={baseBranch}
              onChange={(e) => setBaseBranch(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
              placeholder="main (auto-detected if empty)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Branch to create from. Defaults to main/master if empty.
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none resize-none"
              placeholder="Describe what the AI should do..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="skipTests"
              checked={skipTests}
              onChange={(e) => setSkipTests(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="skipTests" className="text-sm">Skip tests</label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={!name.trim() || !prompt.trim() || !repo}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {tasks.length === 0 && !isCreating ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tasks yet. Create your first predefined task.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{task.name}</h3>
                  <p className="text-sm text-gray-400 truncate">
                    {availableRepos.find((r) => r.path === task.repo)?.name || task.repo}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.prompt}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleRun(task)}
                    disabled={runningTaskId === task.id}
                    className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded"
                  >
                    {runningTaskId === task.id ? '...' : 'Run'}
                  </button>
                  <button
                    onClick={() => handleEdit(task)}
                    className="px-2 py-1 text-sm bg-white/10 hover:bg-white/20 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-2 py-1 text-sm text-red-400 hover:bg-red-600/20 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {task.skipTests && (
                <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-yellow-600/30 text-yellow-400 rounded">
                  Skip tests
                </span>
              )}
              {task.baseBranch && (
                <span className="inline-block mt-2 ml-1 px-2 py-0.5 text-xs bg-blue-600/30 text-blue-400 rounded">
                  from: {task.baseBranch}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
