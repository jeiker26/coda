import { Job, Settings, CodePatch } from './types.js'
import { jobStore } from './store.js'
import { AIService } from './ai-service.js'
import { GitService } from './git-service.js'
import { PatchService } from './patch-service.js'
import { SlackService } from './slack-service.js'
import { loadConventions, formatCommitMessage, formatPRTitle, formatPRBody } from './conventions.js'

// Load conventions on startup
loadConventions().then(() => console.log('[Executor] Conventions loaded'))

// Load settings from environment (can be updated at runtime)
let settings: Settings = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiBaseUrl: process.env.OPENAI_BASE_URL,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL,
  preferredProvider: (process.env.PREFERRED_PROVIDER as 'openai' | 'anthropic') || 'anthropic',
  githubToken: process.env.GITHUB_TOKEN,
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
  maxChangedFiles: parseInt(process.env.MAX_CHANGED_FILES || '10'),
  maxDiffSize: parseInt(process.env.MAX_DIFF_SIZE || '5000'),
  autoRetry: process.env.AUTO_RETRY !== 'false',
  skipTestsByDefault: process.env.SKIP_TESTS_BY_DEFAULT === 'true',
}

let aiService = new AIService(
  settings.openaiApiKey,
  settings.openaiBaseUrl,
  settings.anthropicApiKey,
  settings.anthropicBaseUrl
)

let slackService = new SlackService(settings.slackWebhookUrl)

// Update settings from frontend
export function updateSettings(newSettings: Partial<Settings>): void {
  settings = { ...settings, ...newSettings }
  
  // Recreate services with new settings
  aiService = new AIService(
    settings.openaiApiKey,
    settings.openaiBaseUrl,
    settings.anthropicApiKey,
    settings.anthropicBaseUrl
  )
  slackService = new SlackService(settings.slackWebhookUrl)
  
  console.log('[Executor] Settings updated:', {
    openai: settings.openaiApiKey ? 'configured' : 'not set',
    openaiBaseUrl: settings.openaiBaseUrl || 'default',
    anthropic: settings.anthropicApiKey ? 'configured' : 'not set',
    anthropicBaseUrl: settings.anthropicBaseUrl || 'default',
    preferredProvider: settings.preferredProvider,
    github: settings.githubToken ? 'configured' : 'not set',
  })
}

// Get current settings (redacted for security)
export function getSettingsStatus(): Record<string, string | number | boolean> {
  return {
    openaiApiKey: settings.openaiApiKey ? 'configured' : 'not set',
    openaiBaseUrl: settings.openaiBaseUrl || 'default',
    anthropicApiKey: settings.anthropicApiKey ? 'configured' : 'not set',
    anthropicBaseUrl: settings.anthropicBaseUrl || 'default',
    preferredProvider: settings.preferredProvider || 'anthropic',
    githubToken: settings.githubToken ? 'configured' : 'not set',
    slackWebhookUrl: settings.slackWebhookUrl ? 'configured' : 'not set',
    maxChangedFiles: settings.maxChangedFiles ?? 10,
    maxDiffSize: settings.maxDiffSize ?? 5000,
    autoRetry: settings.autoRetry ?? true,
  }
}

export async function executeJob(jobId: string): Promise<void> {
  const job = jobStore.get(jobId)
  if (!job) {
    console.error(`Job ${jobId} not found`)
    return
  }

  const gitService = new GitService(job.repo, settings.githubToken)
  const patchService = new PatchService(job.repo)
  let originalBranch = ''

  try {
    // Save original branch
    originalBranch = await gitService.getCurrentBranch()
    
    // Update status to coding
    jobStore.update(jobId, { status: 'coding' })
    jobStore.addLog(jobId, 'Starting code generation...')
    await slackService.sendJobUpdate(job.task, job.repo, 'coding')

    // Generate code with AI (pass skills for context)
    const aiResponse = await aiService.generateCode(job.task, job.repo, settings.preferredProvider, job.skills)
    jobStore.addLog(jobId, `AI generated ${aiResponse.patches.length} patches`)
    if (job.skills && job.skills.length > 0) {
      jobStore.addLog(jobId, `Applied ${job.skills.length} skills: ${job.skills.map(s => s.name).join(', ')}`)
    }
    jobStore.addLog(jobId, `Explanation: ${aiResponse.explanation}`)

    // Validate patches
    await patchService.validatePatches(
      aiResponse.patches,
      settings.maxChangedFiles,
      settings.maxDiffSize
    )
    jobStore.addLog(jobId, 'Patches validated')

    // Create branch from base (main/master or specified)
    await gitService.createBranch(job.branch, job.baseBranch)
    jobStore.addLog(jobId, `Created branch: ${job.branch}${job.baseBranch ? ` from ${job.baseBranch}` : ' from default branch'}`)

    // Update status to patching
    jobStore.update(jobId, { status: 'patching' })
    jobStore.addLog(jobId, 'Applying patches...')

    // Apply patches
    await patchService.applyPatches(aiResponse.patches)
    jobStore.addLog(jobId, 'Patches applied')

    // Commit changes - use conventional commit format from conventions
    const commitMessage = formatCommitMessage(job.task)
    await gitService.commitChanges(commitMessage)
    jobStore.addLog(jobId, `Changes committed: ${commitMessage}`)

    // Run tests if not skipped and AI suggested test commands
    if (!job.skipTests && aiResponse.testCommands && aiResponse.testCommands.length > 0) {
      jobStore.update(jobId, { status: 'testing' })
      jobStore.addLog(jobId, 'Running tests...')
      await slackService.sendJobUpdate(job.task, job.repo, 'testing')

      const testResult = await patchService.runTests(aiResponse.testCommands)
      jobStore.addLog(jobId, testResult.output)

      if (!testResult.success) {
        throw new Error('Tests failed')
      }
      jobStore.addLog(jobId, 'Tests passed')
    } else if (job.skipTests) {
      jobStore.addLog(jobId, 'Tests skipped')
    }

    // If dry run, we're done
    if (job.dryRun) {
      jobStore.update(jobId, { status: 'pr_opened' })
      jobStore.addLog(jobId, 'Dry run complete - no PR created')
      await slackService.sendJobUpdate(job.task, job.repo, 'pr_opened')
      return
    }

    // Push and create PR
    jobStore.addLog(jobId, 'Pushing to remote...')
    await gitService.push(job.branch)
    jobStore.addLog(jobId, 'Pushed to remote')

    jobStore.addLog(jobId, 'Creating PR...')
    const prTitle = formatPRTitle(job.task)
    const prBody = formatPRBody(aiResponse.explanation)
    const prUrl = await gitService.createPR(job.branch, prTitle, prBody)

    jobStore.update(jobId, { status: 'pr_opened', prUrl })
    jobStore.addLog(jobId, `PR created: ${prUrl}`)
    await slackService.sendJobUpdate(job.task, job.repo, 'pr_opened', prUrl)

  } catch (error: any) {
    console.error(`Job ${jobId} failed:`, error)
    jobStore.update(jobId, { status: 'failed', error: error.message })
    jobStore.addLog(jobId, `Error: ${error.message}`)
    await slackService.sendJobUpdate(job.task, job.repo, 'failed')

    // Auto-retry if enabled and not already retried
    if (settings.autoRetry && job.retryCount < 1) {
      jobStore.addLog(jobId, 'Auto-retrying...')
      jobStore.update(jobId, { retryCount: job.retryCount + 1, status: 'queued' })
      setTimeout(() => executeJob(jobId), 1000)
    }
  } finally {
    // Cleanup: return to original branch
    if (originalBranch) {
      try {
        await gitService.checkoutOriginalBranch(originalBranch)
      } catch (e) {
        console.error('Failed to checkout original branch:', e)
      }
    }
  }
}

export async function retryJob(jobId: string): Promise<Job | undefined> {
  const job = jobStore.get(jobId)
  if (!job) return undefined

  jobStore.update(jobId, {
    status: 'queued',
    error: undefined,
    retryCount: job.retryCount + 1,
  })
  jobStore.addLog(jobId, 'Job retry requested')

  // Execute in background
  setImmediate(() => executeJob(jobId))

  return jobStore.get(jobId)
}

export async function cancelJob(jobId: string): Promise<Job | undefined> {
  const job = jobStore.get(jobId)
  if (!job) return undefined

  // Only cancel if not already finished
  if (['queued', 'coding', 'patching', 'testing'].includes(job.status)) {
    jobStore.update(jobId, { status: 'cancelled' })
    jobStore.addLog(jobId, 'Job cancelled')
  }

  return jobStore.get(jobId)
}
