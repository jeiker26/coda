import { App, LogLevel } from '@slack/bolt'
import { jobStore } from './store.js'
import { executeJob } from './executor.js'
import { Job } from './types.js'

let slackApp: App | null = null
let isConnected = false

interface SlackBotConfig {
  appToken: string      // xapp-... (App-Level Token for Socket Mode)
  botToken: string      // xoxb-... (Bot User OAuth Token)
}

// Parse commands from messages
interface ParsedCommand {
  action: 'run-task' | 'run-prompt' | 'list-jobs' | 'job-status' | 'cancel-job' | 'help' | 'unknown'
  taskName?: string
  prompt?: string
  repo?: string
  baseBranch?: string
  jobId?: string
}

function parseCommand(text: string): ParsedCommand {
  const cleanText = text.replace(/<@[A-Z0-9]+>/g, '').trim().toLowerCase()
  
  // Help
  if (cleanText === 'help' || cleanText === 'ayuda' || cleanText === '?') {
    return { action: 'help' }
  }

  // List jobs
  if (cleanText.startsWith('list jobs') || cleanText.startsWith('jobs') || cleanText === 'listar') {
    return { action: 'list-jobs' }
  }

  // Job status: "status job-123" or "status 123"
  const statusMatch = cleanText.match(/status\s+(?:job-)?([a-z0-9-]+)/i)
  if (statusMatch) {
    return { action: 'job-status', jobId: statusMatch[1] }
  }

  // Cancel job: "cancel job-123"
  const cancelMatch = cleanText.match(/cancel\s+(?:job-)?([a-z0-9-]+)/i)
  if (cancelMatch) {
    return { action: 'cancel-job', jobId: cancelMatch[1] }
  }

  // Run task: 'run task "Task Name" in repo-name'
  const taskMatch = text.match(/run\s+task\s+["']([^"']+)["']\s+(?:in|repo:?\s*)(\S+)/i)
  if (taskMatch) {
    return { action: 'run-task', taskName: taskMatch[1], repo: taskMatch[2] }
  }

  // Run prompt: 'prompt "do something" repo:my-repo branch:develop' or 'prompt "do something" in my-repo'
  // Supports optional branch parameter
  const promptMatch = text.match(/prompt\s+["']([^"']+)["']\s+(?:in|repo:?\s*)(\S+)(?:\s+(?:branch|from):?\s*(\S+))?/i)
  if (promptMatch) {
    return { 
      action: 'run-prompt', 
      prompt: promptMatch[1], 
      repo: promptMatch[2],
      baseBranch: promptMatch[3] || undefined
    }
  }

  // Simple prompt without repo (will need clarification)
  const simplePromptMatch = text.match(/prompt\s+["']([^"']+)["']/i)
  if (simplePromptMatch) {
    return { action: 'run-prompt', prompt: simplePromptMatch[1] }
  }

  return { action: 'unknown' }
}

function formatJobStatus(job: Job): string {
  const emoji: Record<string, string> = {
    queued: '📋',
    coding: '🤖',
    patching: '🔧',
    testing: '🧪',
    pr_opened: '✅',
    failed: '❌',
    cancelled: '🚫',
  }
  return `${emoji[job.status] || '📌'} \`${job.status}\``
}

function getHelpMessage(): string {
  return `*Coda Commands*

*Run a predefined task:*
\`@Coda run task "Task Name" in repo-name\`

*Run an ad-hoc prompt:*
\`@Coda prompt "Add validation to login form" repo:frontend\`

*Run with specific base branch:*
\`@Coda prompt "Fix bug" repo:frontend branch:develop\`

*List recent jobs:*
\`@Coda list jobs\`

*Check job status:*
\`@Coda status job-abc123\`

*Cancel a job:*
\`@Coda cancel job-abc123\`

*Get help:*
\`@Coda help\`

_Note: If branch is not specified, defaults to main/master._`
}

// Available repos (loaded from store)
let availableRepos: Array<{ name: string; path: string }> = []

export function setAvailableRepos(repos: Array<{ name: string; path: string }>): void {
  availableRepos = repos
}

function findRepoByName(name: string): { name: string; path: string } | undefined {
  const lowerName = name.toLowerCase()
  return availableRepos.find(r => 
    r.name.toLowerCase() === lowerName || 
    r.name.toLowerCase().includes(lowerName) ||
    r.path.toLowerCase().endsWith(lowerName)
  )
}

export async function initSlackBot(config: SlackBotConfig): Promise<void> {
  if (!config.appToken || !config.botToken) {
    console.log('[SlackBot] Missing tokens, Socket Mode disabled')
    return
  }

  try {
    slackApp = new App({
      token: config.botToken,
      appToken: config.appToken,
      socketMode: true,
      logLevel: LogLevel.INFO,
    })

    // Handle @mentions
    slackApp.event('app_mention', async ({ event, say }) => {
      const command = parseCommand(event.text)
      console.log('[SlackBot] Received command:', command)

      switch (command.action) {
        case 'help':
          await say(getHelpMessage())
          break

        case 'list-jobs': {
          const jobs = jobStore.list().slice(0, 10)
          if (jobs.length === 0) {
            await say('No jobs found.')
          } else {
            const jobList = jobs.map(j => 
              `${formatJobStatus(j)} \`${j.id.slice(0, 8)}\` - ${j.task.slice(0, 50)}... (${j.repo.split('/').pop()})`
            ).join('\n')
            await say(`*Recent Jobs:*\n${jobList}`)
          }
          break
        }

        case 'job-status': {
          if (!command.jobId) {
            await say('Please provide a job ID: `@Coda status job-123`')
            break
          }
          // Find job by partial ID
          const allJobs = jobStore.list()
          const job = allJobs.find(j => j.id.includes(command.jobId!))
          if (!job) {
            await say(`Job not found: \`${command.jobId}\``)
          } else {
            let msg = `*Job ${job.id.slice(0, 8)}*\n`
            msg += `${formatJobStatus(job)}\n`
            msg += `*Task:* ${job.task.slice(0, 100)}\n`
            msg += `*Repo:* \`${job.repo.split('/').pop()}\`\n`
            msg += `*Branch:* \`${job.branch}\`\n`
            if (job.prUrl) msg += `*PR:* <${job.prUrl}|View PR>\n`
            if (job.error) msg += `*Error:* ${job.error}\n`
            if (job.logs.length > 0) {
              msg += `*Recent logs:*\n${job.logs.slice(-3).map(l => `• ${l}`).join('\n')}`
            }
            await say(msg)
          }
          break
        }

        case 'cancel-job': {
          if (!command.jobId) {
            await say('Please provide a job ID: `@Coda cancel job-123`')
            break
          }
          const allJobs = jobStore.list()
          const job = allJobs.find(j => j.id.includes(command.jobId!))
          if (!job) {
            await say(`Job not found: \`${command.jobId}\``)
          } else if (!['queued', 'coding', 'patching', 'testing'].includes(job.status)) {
            await say(`Cannot cancel job in status: \`${job.status}\``)
          } else {
            jobStore.update(job.id, { status: 'cancelled' })
            await say(`Job \`${job.id.slice(0, 8)}\` cancelled.`)
          }
          break
        }

        case 'run-task': {
          // TODO: Integrate with tasks store once available via runner
          await say(`Task execution from Slack coming soon!\nTask: "${command.taskName}" in ${command.repo}`)
          break
        }

        case 'run-prompt': {
          if (!command.prompt) {
            await say('Please provide a prompt: `@Coda prompt "your task" repo:repo-name`')
            break
          }
          if (!command.repo) {
            const repoList = availableRepos.slice(0, 5).map(r => `• \`${r.name}\``).join('\n')
            await say(`Please specify a repo:\n\`@Coda prompt "${command.prompt}" repo:repo-name\`\n\n*Available repos:*\n${repoList}`)
            break
          }
          
          const repo = findRepoByName(command.repo)
          if (!repo) {
            const repoList = availableRepos.slice(0, 5).map(r => `• \`${r.name}\``).join('\n')
            await say(`Repo not found: \`${command.repo}\`\n\n*Available repos:*\n${repoList}`)
            break
          }

          // Create job with optional baseBranch
          const job = jobStore.create({
            task: command.prompt,
            repo: repo.path,
            baseBranch: command.baseBranch,
            skipTests: true, // Default to skip tests from Slack
          })
          
          const branchInfo = command.baseBranch 
            ? `\n*From branch:* \`${command.baseBranch}\`` 
            : '\n*From branch:* `main/master` (auto)'
          
          await say(`🚀 Job created: \`${job.id.slice(0, 8)}\`\n*Task:* ${command.prompt}\n*Repo:* \`${repo.name}\`${branchInfo}\n\nI'll notify you when it's done!`)
          
          // Execute in background
          setImmediate(() => executeJob(job.id))
          break
        }

        default:
          await say(`I didn't understand that. Try \`@Coda help\` for available commands.`)
      }
    })

    // Handle direct messages
    slackApp.event('message', async ({ event, say }) => {
      // Only handle DMs (not channel messages which are handled by app_mention)
      if ((event as any).channel_type !== 'im') return
      
      const text = (event as any).text || ''
      const command = parseCommand(text)
      
      // Handle same as mentions but without requiring @mention
      if (command.action === 'help') {
        await say(getHelpMessage())
      } else if (command.action !== 'unknown') {
        // Reuse app_mention logic by simulating
        await say(`Processing: ${command.action}...`)
      }
    })

    await slackApp.start()
    isConnected = true
    console.log('[SlackBot] Socket Mode connected successfully')
  } catch (error) {
    console.error('[SlackBot] Failed to initialize:', error)
    isConnected = false
  }
}

export async function stopSlackBot(): Promise<void> {
  if (slackApp) {
    await slackApp.stop()
    slackApp = null
    isConnected = false
    console.log('[SlackBot] Disconnected')
  }
}

export function isSlackBotConnected(): boolean {
  return isConnected
}

// Send a message to a channel (for notifications)
export async function sendToChannel(channel: string, message: string): Promise<void> {
  if (!slackApp || !isConnected) return
  
  try {
    await slackApp.client.chat.postMessage({
      channel,
      text: message,
    })
  } catch (error) {
    console.error('[SlackBot] Failed to send message:', error)
  }
}
