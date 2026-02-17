import simpleGit, { SimpleGit } from 'simple-git'
import { Octokit } from '@octokit/rest'
import * as path from 'path'

export class GitService {
  private git: SimpleGit
  private octokit: Octokit | null = null
  private repoPath: string

  constructor(repoPath: string, githubToken?: string) {
    this.repoPath = repoPath
    this.git = simpleGit(repoPath)
    
    if (githubToken) {
      this.octokit = new Octokit({ auth: githubToken })
    }
  }

  async createBranch(branchName: string): Promise<void> {
    // Ensure we're on a clean state
    await this.git.fetch()
    
    // Delete local branch if it already exists (from previous failed attempt)
    try {
      await this.git.deleteLocalBranch(branchName, true)
    } catch (e) {
      // Branch doesn't exist, that's fine
    }

    // Delete remote branch if it exists (from previous failed attempt)
    try {
      await this.git.push('origin', `:${branchName}`)
    } catch (e) {
      // Remote branch doesn't exist, that's fine
    }
    
    // Create and checkout new branch
    await this.git.checkoutLocalBranch(branchName)
  }

  async commitChanges(message: string): Promise<void> {
    await this.git.add('.')
    await this.git.commit(message)
  }

  async push(branchName: string): Promise<void> {
    await this.git.push('origin', branchName, ['--set-upstream'])
  }

  async createPR(
    branchName: string,
    title: string,
    body: string
  ): Promise<string> {
    // Get repo info from remote
    const remotes = await this.git.getRemotes(true)
    const origin = remotes.find(r => r.name === 'origin')
    if (!origin?.refs.fetch) {
      throw new Error('No origin remote found')
    }

    const { owner, repo } = this.parseGitHubUrl(origin.refs.fetch)
    
    // Try using GitHub CLI first (more reliable for org repos)
    try {
      const prUrl = await this.createPRWithCLI(branchName, title, body)
      return prUrl
    } catch (cliError) {
      console.log('[GitService] gh CLI failed, trying Octokit API...')
    }

    // Fallback to Octokit API
    if (!this.octokit) {
      throw new Error('GitHub token not configured and gh CLI not available')
    }

    try {
      // Get default branch
      const { data: repoData } = await this.octokit.repos.get({ owner, repo })
      const baseBranch = repoData.default_branch

      // Create PR
      const { data: pr } = await this.octokit.pulls.create({
        owner,
        repo,
        title,
        body,
        head: branchName,
        base: baseBranch,
      })

      return pr.html_url
    } catch (error: any) {
      // Provide helpful error message
      if (error.status === 404) {
        throw new Error(
          `GitHub API returned 404. This usually means:\n` +
          `1. The token doesn't have access to ${owner}/${repo}\n` +
          `2. For org repos, ensure token has 'repo' scope and org access\n` +
          `3. For fine-grained tokens, add this repo explicitly\n` +
          `Try: gh auth login (GitHub CLI) as alternative`
        )
      }
      throw error
    }
  }

  private async createPRWithCLI(branchName: string, title: string, body: string): Promise<string> {
    const { execSync } = await import('child_process')
    
    // Use gh CLI to create PR (respects gh auth)
    const result = execSync(
      `gh pr create --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}" --head "${branchName}"`,
      { cwd: this.repoPath, encoding: 'utf-8' }
    )
    
    // Extract PR URL from output
    const urlMatch = result.match(/https:\/\/github\.com\/[^\s]+/)
    if (urlMatch) {
      return urlMatch[0]
    }
    
    return result.trim()
  }

  async getDiff(): Promise<string> {
    return this.git.diff(['--cached'])
  }

  async getStatus(): Promise<string> {
    const status = await this.git.status()
    return JSON.stringify(status, null, 2)
  }

  async checkoutOriginalBranch(originalBranch: string): Promise<void> {
    await this.git.checkout(originalBranch)
  }

  async getCurrentBranch(): Promise<string> {
    return this.git.revparse(['--abbrev-ref', 'HEAD'])
  }

  async deleteBranch(branchName: string): Promise<void> {
    try {
      await this.git.deleteLocalBranch(branchName, true)
    } catch (e) {
      // Ignore if branch doesn't exist
    }
  }

  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    // Handle SSH and HTTPS URLs
    // git@github.com:owner/repo.git
    // https://github.com/owner/repo.git
    const patterns = [
      /github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return { owner: match[1], repo: match[2] }
      }
    }

    throw new Error(`Could not parse GitHub URL: ${url}`)
  }
}
