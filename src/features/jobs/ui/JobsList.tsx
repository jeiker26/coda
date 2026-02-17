import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useJobsStore } from '../model/jobs.store'
import { runnerApi } from '../api/jobs.api'
import { JobRow } from './JobRow'
import { JobDetails } from './JobDetails'

export function JobsList() {
  const queryClient = useQueryClient()
  const { jobs, setJobs, selectedJobId, selectJob } = useJobsStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: runnerApi.list,
    refetchInterval: 3000,
  })

  const retryMutation = useMutation({
    mutationFn: runnerApi.retry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  })

  const cancelMutation = useMutation({
    mutationFn: runnerApi.cancel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  })

  useEffect(() => {
    if (data) setJobs(data)
  }, [data, setJobs])

  const selectedJob = jobs.find((j) => j.id === selectedJobId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400">
        Loading jobs...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 text-red-400">
        Failed to load jobs. Is the runner running?
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400">
        No jobs yet. Create a task to get started.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 max-h-60 overflow-auto">
        {jobs.map((job) => (
          <JobRow
            key={job.id}
            job={job}
            onClick={() => selectJob(job.id)}
            isSelected={job.id === selectedJobId}
          />
        ))}
      </div>

      {selectedJob && (
        <JobDetails
          job={selectedJob}
          onRetry={() => retryMutation.mutate(selectedJob.id)}
          onCancel={() => cancelMutation.mutate(selectedJob.id)}
        />
      )}
    </div>
  )
}
