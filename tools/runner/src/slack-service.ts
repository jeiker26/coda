import { Job, SkillContext, CodePatch } from './types.js'

interface SlackBlock {
  type: string
  text?: { type: string; text: string; emoji?: boolean }
  elements?: Array<{ type: string; text?: string; url?: string; style?: string }>
  fields?: Array<{ type: string; text: string }>
}

export class SlackService {
  constructor(private webhookUrl?: string) {}

  async send(message: string): Promise<void> {
    if (!this.webhookUrl) {
      console.log('[Slack] No webhook configured, skipping notification')
      return
    }

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      })
    } catch (e) {
      console.error('[Slack] Failed to send notification:', e)
    }
  }

  async sendBlocks(blocks: SlackBlock[], text: string): Promise<void> {
    if (!this.webhookUrl) {
      console.log('[Slack] No webhook configured, skipping notification')
      return
    }

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, blocks }),
      })
    } catch (e) {
      console.error('[Slack] Failed to send notification:', e)
    }
  }

  async sendJobUpdate(
    task: string,
    repo: string,
    status: string,
    prUrl?: string
  ): Promise<void> {
    const emoji = this.getStatusEmoji(status)
    const color = this.getStatusColor(status)

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${emoji} Coda: ${this.formatStatus(status)}`, emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Repo:*\n\`${this.getRepoName(repo)}\`` },
          { type: 'mrkdwn', text: `*Status:*\n${this.formatStatus(status)}` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Task:*\n${task.length > 200 ? task.slice(0, 200) + '...' : task}` },
      },
    ]

    if (prUrl) {
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Pull Request:* <${prUrl}|View PR>` },
      })
    }

    await this.sendBlocks(blocks, `Coda: ${status} - ${task.slice(0, 50)}`)
  }

  async sendDetailedJobUpdate(job: Job, patches?: CodePatch[], explanation?: string): Promise<void> {
    const emoji = this.getStatusEmoji(job.status)
    const repoName = this.getRepoName(job.repo)

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${emoji} Coda: ${this.formatStatus(job.status)}`, emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Repo:*\n\`${repoName}\`` },
          { type: 'mrkdwn', text: `*Branch:*\n\`${job.branch}\`` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Task:*\n${job.task.length > 300 ? job.task.slice(0, 300) + '...' : job.task}` },
      },
    ]

    // Add skills if present
    if (job.skills && job.skills.length > 0) {
      const skillNames = job.skills.map(s => `\`${s.name}\``).join(', ')
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Skills Applied:* ${skillNames}` },
      })
    }

    // Add explanation if present
    if (explanation) {
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*AI Explanation:*\n${explanation.length > 500 ? explanation.slice(0, 500) + '...' : explanation}` },
      })
    }

    // Add patches summary if present
    if (patches && patches.length > 0) {
      const patchSummary = patches.map(p => {
        const icon = p.operation === 'create' ? '➕' : p.operation === 'delete' ? '➖' : '📝'
        return `${icon} \`${p.filePath}\``
      }).join('\n')
      
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Files Changed (${patches.length}):*\n${patchSummary.slice(0, 500)}` },
      })
    }

    // Add PR link if present
    if (job.prUrl) {
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Pull Request:* <${job.prUrl}|View PR>` },
      })
    }

    // Add error if failed
    if (job.status === 'failed' && job.error) {
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Error:*\n\`\`\`${job.error.slice(0, 500)}\`\`\`` },
      })
    }

    // Add recent logs
    if (job.logs.length > 0) {
      const recentLogs = job.logs.slice(-3).map(l => `• ${l}`).join('\n')
      blocks.push({
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `*Recent activity:*\n${recentLogs}` }],
      })
    }

    await this.sendBlocks(blocks, `Coda: ${job.status} - ${job.task.slice(0, 50)}`)
  }

  async sendJobCompleted(job: Job, patches: CodePatch[], explanation: string): Promise<void> {
    await this.sendDetailedJobUpdate(job, patches, explanation)
  }

  async sendJobFailed(job: Job): Promise<void> {
    await this.sendDetailedJobUpdate(job)
  }

  private getStatusEmoji(status: string): string {
    const emojis: Record<string, string> = {
      queued: '📋',
      coding: '🤖',
      patching: '🔧',
      testing: '🧪',
      pr_opened: '✅',
      failed: '❌',
      cancelled: '🚫',
    }
    return emojis[status] || '📌'
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      queued: '#808080',
      coding: '#3498db',
      patching: '#f39c12',
      testing: '#9b59b6',
      pr_opened: '#2ecc71',
      failed: '#e74c3c',
      cancelled: '#95a5a6',
    }
    return colors[status] || '#808080'
  }

  private formatStatus(status: string): string {
    const labels: Record<string, string> = {
      queued: 'Queued',
      coding: 'Generating Code',
      patching: 'Applying Changes',
      testing: 'Running Tests',
      pr_opened: 'PR Created',
      failed: 'Failed',
      cancelled: 'Cancelled',
    }
    return labels[status] || status
  }

  private getRepoName(repoPath: string): string {
    return repoPath.split('/').pop() || repoPath
  }
}
