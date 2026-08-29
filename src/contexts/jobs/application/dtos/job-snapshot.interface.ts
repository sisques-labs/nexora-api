import { Job, JobStatus } from '@contexts/jobs/domain/aggregates/job.aggregate';

/**
 * The read-only shape every jobs command handler returns. Crossing the
 * context boundary as a snapshot, never as the Job aggregate itself —
 * see job.aggregate.ts's docstring.
 */
export interface JobSnapshot {
  id: string;
  model: string;
  status: JobStatus;
  nodeId: string | null;
  createdAt: Date;
}

export function toJobSnapshot(job: Job): JobSnapshot {
  return {
    id: job.id,
    model: job.model,
    status: job.status,
    nodeId: job.nodeId,
    createdAt: job.createdAt,
  };
}
