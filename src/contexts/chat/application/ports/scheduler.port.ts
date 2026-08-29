export const SCHEDULER_PORT = Symbol('SCHEDULER_PORT');

/**
 * Decides which node a job goes to. Takes jobId + model as primitives —
 * not the jobs context's Job aggregate, which chat never sees either.
 */
export interface ISchedulerPort {
  selectNode(jobId: string, model: string): Promise<string>;
}
