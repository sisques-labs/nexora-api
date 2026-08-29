export interface JobRef {
  id: string;
}

export const JOBS_PORT = Symbol('JOBS_PORT');

/**
 * chat's anti-corruption seam to the jobs context: chat only ever needs
 * a job's id to keep threading through its own orchestration, so that's
 * all this port exposes — not the jobs context's Job aggregate or its
 * JobSnapshot DTO, which stay internal to that context and its adapter.
 */
export interface IJobsPort {
  create(model: string): Promise<JobRef>;
  markScheduled(jobId: string, nodeId: string): Promise<void>;
  markRunning(jobId: string): Promise<void>;
  markCompleted(jobId: string): Promise<void>;
  markFailed(jobId: string, cause: unknown): Promise<void>;
}
