import { Job } from '@contexts/jobs/domain/aggregates/job.aggregate';

export const JOBS_REPOSITORY = Symbol('JOBS_REPOSITORY');

/**
 * jobs' own persistence contract (not to be confused with a port —
 * ports are for reaching OTHER contexts; a repository is how a context
 * persists its own aggregate). In-memory in v0 (see
 * infrastructure/repositories); a real one lands when nexora-jobs picks
 * up Postgres.
 */
export interface IJobsRepository {
  save(job: Job): Promise<void>;
  findById(id: string): Promise<Job | null>;
}
