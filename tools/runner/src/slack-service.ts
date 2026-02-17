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

  async sendJobUpdate(
    task: string,
    repo: string,
    status: string,
    prUrl?: string
  ): Promise<void> {
    let emoji = ''
    switch (status) {
      case 'queued': emoji = ''; break
      case 'coding': emoji = ''; break
      case 'patching': emoji = ''; break
      case 'testing': emoji = ''; break
      case 'pr_opened': emoji = ''; break
      case 'failed': emoji = ''; break
      case 'cancelled': emoji = ''; break
    }

    let message = `${emoji} *Coda Update*\n`
    message += `*Task:* ${task}\n`
    message += `*Repo:* ${repo}\n`
    message += `*Status:* ${status}`

    if (prUrl) {
      message += `\n*PR:* ${prUrl}`
    }

    await this.send(message)
  }
}
