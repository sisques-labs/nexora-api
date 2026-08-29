import { JobAggregate } from '@contexts/chat/domain/aggregates/job.aggregate';

export const SCHEDULER_GATEWAY = Symbol('SCHEDULER_GATEWAY');

/**
 * Decides which node a job goes to. In v0, with a single node
 * registered, it's effectively a direct router, not a real decision.
 */
export interface ISchedulerGateway {
  selectNode(job: JobAggregate): Promise<string>;
}
