import { Job, JobStatus, SkillContext, CreateJobRequest } from './types.js'
import { v4 as uuid } from 'uuid'
import { dbService } from './db-service.js'

// Generate a short unique ID (6 chars)
function shortId(): string {
  return Math.random().toString(36).substring(2, 8)
}

// Generate a slug from task description for branch name
// Rules: must contain hyphen, max 40 chars
function generateBranchSlug(task: string): string {
  const slug = task
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .slice(0, 20)                   // Limit slug length
    .replace(/-+$/, '')             // Remove trailing hyphens
  
  // Format: agent-<slug>-<shortId> (max 40 chars total, always has hyphens)
  const id = shortId()
  const branch = `agent-${slug || 'task'}-${id}`
  return branch.slice(0, 40)
}

class JobStore {
  // Overload: accept object or individual params
  create(request: CreateJobRequest): Job
  create(task: string, repo: string, dryRun?: boolean, skipTests?: boolean, skills?: SkillContext[]): Job
  create(
    taskOrRequest: string | CreateJobRequest,
    repo?: string,
    dryRun: boolean = false,
    skipTests: boolean = false,
    skills?: SkillContext[]
  ): Job {
    // Handle object form
    if (typeof taskOrRequest === 'object') {
      const req = taskOrRequest
      return this.createJob(req.task, req.repo, req.dryRun ?? false, req.skipTests ?? false, req.skills)
    }
    // Handle individual params form
    return this.createJob(taskOrRequest, repo!, dryRun, skipTests, skills)
  }

  private createJob(
    task: string,
    repo: string,
    dryRun: boolean,
    skipTests: boolean,
    skills?: SkillContext[]
  ): Job {
    const now = new Date().toISOString()
    const job: Job = {
      id: uuid(),
      task,
      repo,
      branch: generateBranchSlug(task),
      status: 'queued',
      logs: [],
      createdAt: now,
      updatedAt: now,
      dryRun,
      skipTests,
      retryCount: 0,
      skills,
    }
    return dbService.create(job)
  }

  get(id: string): Job | undefined {
    return dbService.get(id)
  }

  list(): Job[] {
    return dbService.list()
  }

  listByStatus(status: JobStatus): Job[] {
    return dbService.listByStatus(status)
  }

  listByRepo(repo: string): Job[] {
    return dbService.listByRepo(repo)
  }

  update(id: string, updates: Partial<Job>): Job | undefined {
    const job = dbService.get(id)
    if (!job) return undefined
    
    const updated: Job = {
      ...job,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return dbService.update(updated)
  }

  addLog(id: string, message: string): void {
    const job = dbService.get(id)
    if (job) {
      job.logs.push(`[${new Date().toISOString()}] ${message}`)
      job.updatedAt = new Date().toISOString()
      dbService.update(job)
    }
  }

  delete(id: string): boolean {
    return dbService.delete(id)
  }
}

export const jobStore = new JobStore()
