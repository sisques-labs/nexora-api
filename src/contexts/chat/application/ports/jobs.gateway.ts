import { JobAggregate } from '@contexts/chat/domain/aggregates/job.aggregate';

export const JOBS_GATEWAY = Symbol('JOBS_GATEWAY');

/**
 * Manages the job lifecycle in nexora-jobs.
 */
export interface IJobsGateway {
  create(model: string): Promise<JobAggregate>;
  markScheduled(jobId: string, nodeId: string): Promise<JobAggregate>;
  markRunning(jobId: string): Promise<JobAggregate>;
  markCompleted(jobId: string): Promise<JobAggregate>;
  markFailed(jobId: string, cause: unknown): Promise<JobAggregate>;
}
