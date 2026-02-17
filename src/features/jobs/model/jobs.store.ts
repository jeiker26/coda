import { create } from 'zustand'
import { Job } from './jobs.types'

interface JobsState {
  jobs: Job[]
  selectedJobId: string | null
  setJobs: (jobs: Job[]) => void
  addJob: (job: Job) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  selectJob: (id: string | null) => void
}

export const useJobsStore = create<JobsState>((set) => ({
  jobs: [],
  selectedJobId: null,
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (id, updates) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id ? { ...job, ...updates } : job
      ),
    })),
  selectJob: (id) => set({ selectedJobId: id }),
}))
