import { invoke } from '@tauri-apps/api/core'
import { Job, CreateJobRequest } from '../model/jobs.types'

const RUNNER_URL = 'http://localhost:3847'

export const jobsApi = {
  async create(request: CreateJobRequest): Promise<Job> {
    return invoke<Job>('jobs_create', { request })
  },

  async list(): Promise<Job[]> {
    return invoke<Job[]>('jobs_list')
  },

  async getById(id: string): Promise<Job> {
    return invoke<Job>('jobs_detail', { id })
  },

  async retry(id: string): Promise<Job> {
    return invoke<Job>('jobs_retry', { id })
  },

  async cancel(id: string): Promise<Job> {
    return invoke<Job>('jobs_cancel', { id })
  },
}

// Direct runner API (fallback when Tauri not available)
export const runnerApi = {
  async create(request: CreateJobRequest): Promise<Job> {
    const res = await fetch(`${RUNNER_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    return res.json()
  },

  async list(): Promise<Job[]> {
    const res = await fetch(`${RUNNER_URL}/jobs`)
    return res.json()
  },

  async getById(id: string): Promise<Job> {
    const res = await fetch(`${RUNNER_URL}/jobs/${id}`)
    return res.json()
  },

  async retry(id: string): Promise<Job> {
    const res = await fetch(`${RUNNER_URL}/jobs/${id}/retry`, { method: 'POST' })
    return res.json()
  },

  async cancel(id: string): Promise<Job> {
    const res = await fetch(`${RUNNER_URL}/jobs/${id}/cancel`, { method: 'POST' })
    return res.json()
  },
}
