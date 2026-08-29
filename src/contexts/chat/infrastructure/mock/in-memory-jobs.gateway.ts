import { randomUUID } from 'crypto';

import { IJobsGateway } from '@contexts/chat/application/ports/jobs.gateway';
import { JobAggregate } from '@contexts/chat/domain/aggregates/job.aggregate';
import { Injectable } from '@nestjs/common';

/**
 * Stands in for nexora-jobs: keeps the job lifecycle in memory, inside
 * nexora-api's own process.
 */
@Injectable()
export class InMemoryJobsGateway implements IJobsGateway {
  private readonly jobs = new Map<string, JobAggregate>();

  async create(model: string): Promise<JobAggregate> {
    const job = JobAggregate.createdFor(randomUUID(), model, new Date());
    this.jobs.set(job.id, job);
    return job;
  }

  async markScheduled(jobId: string, nodeId: string): Promise<JobAggregate> {
    return this.transition(jobId, (job) => job.markScheduled(nodeId));
  }

  async markRunning(jobId: string): Promise<JobAggregate> {
    return this.transition(jobId, (job) => job.markRunning());
  }

  async markCompleted(jobId: string): Promise<JobAggregate> {
    return this.transition(jobId, (job) => job.markCompleted());
  }

  async markFailed(jobId: string, _cause: unknown): Promise<JobAggregate> {
    return this.transition(jobId, (job) => job.markFailed());
  }

  private async transition(
    jobId: string,
    mutate: (job: JobAggregate) => JobAggregate,
  ): Promise<JobAggregate> {
    const existingJob = this.jobs.get(jobId);
    if (!existingJob) {
      throw new Error(`job "${jobId}" not found`);
    }
    const updatedJob = mutate(existingJob);
    this.jobs.set(jobId, updatedJob);
    return updatedJob;
  }
}
