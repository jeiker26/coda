import { Job, JobStatus } from '../model/jobs.types'
import { open } from '@tauri-apps/plugin-shell'

const statusColors: Record<JobStatus, string> = {
  queued: 'bg-gray-500',
  coding: 'bg-yellow-500',
  patching: 'bg-blue-500',
  testing: 'bg-purple-500',
  pr_opened: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-600',
}

interface JobRowProps {
  job: Job
  onClick: () => void
  isSelected: boolean
}

export function JobRow({ job, onClick, isSelected }: JobRowProps) {
  const handlePRClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (job.prUrl) {
      await open(job.prUrl)
    }
  }

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-600/30 border border-blue-500' : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium truncate max-w-[200px]">
          {job.task}
        </span>
        <div className="flex items-center gap-2">
          {job.prUrl && (
            <button
              onClick={handlePRClick}
              className="px-2 py-0.5 text-xs bg-green-600 hover:bg-green-500 rounded text-white"
              title={job.prUrl}
            >
              PR
            </button>
          )}
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${statusColors[job.status]} text-white`}
          >
            {job.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="truncate max-w-[150px]">{job.repo.split('/').pop()}</span>
        {job.branch && (
          <>
            <span>/</span>
            <span className="truncate max-w-[100px]">{job.branch}</span>
          </>
        )}
      </div>
    </div>
  )
}
