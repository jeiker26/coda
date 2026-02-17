import Database from 'better-sqlite3'
import { join } from 'path'
import { homedir } from 'os'
import { mkdirSync, existsSync } from 'fs'
import { Job, JobStatus, SkillContext } from './types.js'

// Store database in user's app data directory
const APP_DATA_DIR = join(homedir(), '.mac-agent')
const DB_PATH = join(APP_DATA_DIR, 'jobs.db')

// Ensure app data directory exists
if (!existsSync(APP_DATA_DIR)) {
  mkdirSync(APP_DATA_DIR, { recursive: true })
}

const db = new Database(DB_PATH)

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    task TEXT NOT NULL,
    repo TEXT NOT NULL,
    branch TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    pr_url TEXT,
    error TEXT,
    logs TEXT DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    dry_run INTEGER NOT NULL DEFAULT 0,
    skip_tests INTEGER NOT NULL DEFAULT 0,
    retry_count INTEGER NOT NULL DEFAULT 0,
    skills TEXT DEFAULT '[]'
  );

  CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
  CREATE INDEX IF NOT EXISTS idx_jobs_repo ON jobs(repo);
  CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
`)

// Migration: Add skills column if it doesn't exist (for existing databases)
try {
  db.exec(`ALTER TABLE jobs ADD COLUMN skills TEXT DEFAULT '[]'`)
  console.log('[DB] Added skills column to jobs table')
} catch (e: any) {
  // Column already exists, ignore error
  if (!e.message.includes('duplicate column')) {
    console.error('[DB] Migration error:', e.message)
  }
}

// Prepared statements for better performance
const insertJob = db.prepare(`
  INSERT INTO jobs (id, task, repo, branch, status, logs, created_at, updated_at, dry_run, skip_tests, retry_count, skills)
  VALUES (@id, @task, @repo, @branch, @status, @logs, @createdAt, @updatedAt, @dryRun, @skipTests, @retryCount, @skills)
`)

const selectJob = db.prepare(`SELECT * FROM jobs WHERE id = ?`)

const selectAllJobs = db.prepare(`
  SELECT * FROM jobs ORDER BY created_at DESC
`)

const selectJobsByStatus = db.prepare(`
  SELECT * FROM jobs WHERE status = ? ORDER BY created_at DESC
`)

const selectJobsByRepo = db.prepare(`
  SELECT * FROM jobs WHERE repo = ? ORDER BY created_at DESC
`)

const updateJobStmt = db.prepare(`
  UPDATE jobs SET
    status = @status,
    pr_url = @prUrl,
    error = @error,
    logs = @logs,
    updated_at = @updatedAt,
    branch = @branch,
    retry_count = @retryCount,
    skills = @skills
  WHERE id = @id
`)

const deleteJobStmt = db.prepare(`DELETE FROM jobs WHERE id = ?`)

// Row mapper: convert database row to Job object
function rowToJob(row: any): Job {
  return {
    id: row.id,
    task: row.task,
    repo: row.repo,
    branch: row.branch,
    status: row.status as JobStatus,
    prUrl: row.pr_url || undefined,
    error: row.error || undefined,
    logs: JSON.parse(row.logs || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    dryRun: Boolean(row.dry_run),
    skipTests: Boolean(row.skip_tests),
    retryCount: row.retry_count,
    skills: JSON.parse(row.skills || '[]') as SkillContext[],
  }
}

// Job mapper: convert Job object to database params
function jobToParams(job: Job): any {
  return {
    id: job.id,
    task: job.task,
    repo: job.repo,
    branch: job.branch,
    status: job.status,
    prUrl: job.prUrl || null,
    error: job.error || null,
    logs: JSON.stringify(job.logs),
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    dryRun: job.dryRun ? 1 : 0,
    skipTests: job.skipTests ? 1 : 0,
    retryCount: job.retryCount,
    skills: JSON.stringify(job.skills || []),
  }
}

export const dbService = {
  create(job: Job): Job {
    insertJob.run(jobToParams(job))
    return job
  },

  get(id: string): Job | undefined {
    const row = selectJob.get(id)
    return row ? rowToJob(row) : undefined
  },

  list(): Job[] {
    const rows = selectAllJobs.all()
    return rows.map(rowToJob)
  },

  listByStatus(status: JobStatus): Job[] {
    const rows = selectJobsByStatus.all(status)
    return rows.map(rowToJob)
  },

  listByRepo(repo: string): Job[] {
    const rows = selectJobsByRepo.all(repo)
    return rows.map(rowToJob)
  },

  update(job: Job): Job {
    updateJobStmt.run(jobToParams(job))
    return job
  },

  delete(id: string): boolean {
    const result = deleteJobStmt.run(id)
    return result.changes > 0
  },

  // Get database path (useful for debugging)
  getDbPath(): string {
    return DB_PATH
  },

  // Close database connection (for cleanup)
  close(): void {
    db.close()
  },
}

console.log(`[DB] SQLite database initialized at ${DB_PATH}`)
