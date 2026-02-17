import { Job } from '../model/jobs.types'
import { open } from '@tauri-apps/plugin-shell'

interface JobDetailsProps {
  job: Job
  onRetry: () => void
  onCancel: () => void
}

export function JobDetails({ job, onRetry, onCancel }: JobDetailsProps) {
  const handleOpenPR = async () => {
    if (job.prUrl) {
      await open(job.prUrl)
    }
  }

  return (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Job Details</h3>
        <div className="flex gap-2">
          {job.status === 'failed' && (
            <button
              onClick={onRetry}
              className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-500 rounded"
            >
              Retry
            </button>
          )}
          {['queued', 'coding', 'patching', 'testing'].includes(job.status) && (
            <button
              onClick={onCancel}
              className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 rounded"
            >
              Cancel
            </button>
          )}
          {job.prUrl && (
            <button
              onClick={handleOpenPR}
              className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 rounded"
            >
              Open PR
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="text-gray-400">Task:</span>
          <p className="mt-1">{job.task}</p>
        </div>
        <div>
          <span className="text-gray-400">Repository:</span>
          <p className="mt-1">{job.repo}</p>
        </div>
        {job.branch && (
          <div>
            <span className="text-gray-400">Branch:</span>
            <p className="mt-1">{job.branch}</p>
          </div>
        )}
        {job.error && (
          <div>
            <span className="text-red-400">Error:</span>
            <p className="mt-1 text-red-300 bg-red-900/30 p-2 rounded">{job.error}</p>
          </div>
        )}
        {job.logs.length > 0 && (
          <div>
            <span className="text-gray-400">Logs:</span>
            <div className="mt-1 bg-black/30 p-2 rounded max-h-40 overflow-auto font-mono text-xs">
              {job.logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
