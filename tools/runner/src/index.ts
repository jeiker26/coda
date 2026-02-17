import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import * as fs from 'fs/promises'
import * as path from 'path'
import { jobStore } from './store.js'
import { executeJob, retryJob, cancelJob, updateSettings, getSettingsStatus } from './executor.js'
import { CreateJobRequest, Settings } from './types.js'

// Load environment variables
config()

const app = express()
const PORT = process.env.PORT || 3847
const WEBSTORM_PROJECTS = process.env.PROJECTS_PATH || '/Users/jesusjavegamanzanedo/WebstormProjects'

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Update settings from frontend
app.post('/settings', (req, res) => {
  try {
    const settings = req.body as Partial<Settings>
    updateSettings(settings)
    console.log('[Runner] Settings updated')
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Get current settings status (redacted)
app.get('/settings', (req, res) => {
  res.json(getSettingsStatus())
})

// List available repositories
app.get('/repos', async (req, res) => {
  try {
    const entries = await fs.readdir(WEBSTORM_PROJECTS, { withFileTypes: true })
    const repos: Array<{ name: string; path: string }> = []

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const repoPath = path.join(WEBSTORM_PROJECTS, entry.name)
        // Check if it's a git repo
        try {
          await fs.access(path.join(repoPath, '.git'))
          repos.push({ name: entry.name, path: repoPath })
        } catch {
          // Not a git repo, skip
        }
      }
    }

    res.json(repos)
  } catch (error: any) {
    console.error('[Runner] Failed to list repos:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create job
app.post('/jobs', async (req, res) => {
  try {
    const { task, repo, dryRun, skipTests } = req.body as CreateJobRequest

    if (!task || !repo) {
      return res.status(400).json({ error: 'task and repo are required' })
    }

    const job = jobStore.create(task, repo, dryRun, skipTests)
    console.log(`[Runner] Created job ${job.id}: ${task} (skipTests: ${skipTests})`)

    // Execute job in background
    setImmediate(() => executeJob(job.id))

    res.status(201).json(job)
  } catch (error: any) {
    console.error('[Runner] Failed to create job:', error)
    res.status(500).json({ error: error.message })
  }
})

// List jobs
app.get('/jobs', (req, res) => {
  const jobs = jobStore.list()
  res.json(jobs)
})

// Get job by ID
app.get('/jobs/:id', (req, res) => {
  const job = jobStore.get(req.params.id)
  if (!job) {
    return res.status(404).json({ error: 'Job not found' })
  }
  res.json(job)
})

// Retry job
app.post('/jobs/:id/retry', async (req, res) => {
  const job = await retryJob(req.params.id)
  if (!job) {
    return res.status(404).json({ error: 'Job not found' })
  }
  res.json(job)
})

// Cancel job
app.post('/jobs/:id/cancel', async (req, res) => {
  const job = await cancelJob(req.params.id)
  if (!job) {
    return res.status(404).json({ error: 'Job not found' })
  }
  res.json(job)
})

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║         Mac Agent Runner Started           ║
╠════════════════════════════════════════════╣
║  Port: ${PORT}                               ║
║  API:  http://localhost:${PORT}              ║
╚════════════════════════════════════════════╝
  `)
  
  // Log configuration status
  console.log('Configuration:')
  console.log(`  OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'configured' : 'not set'}`)
  console.log(`  OpenAI Base URL: ${process.env.OPENAI_BASE_URL || 'default'}`)
  console.log(`  Anthropic API Key: ${process.env.ANTHROPIC_API_KEY ? 'configured' : 'not set'}`)
  console.log(`  GitHub Token: ${process.env.GITHUB_TOKEN ? 'configured' : 'not set'}`)
  console.log(`  Slack Webhook: ${process.env.SLACK_WEBHOOK_URL ? 'configured' : 'not set'}`)
  console.log('')
})
