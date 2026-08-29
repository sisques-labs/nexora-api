import { Job } from '@contexts/jobs/domain/aggregates/job.aggregate';
import { IJobsRepository } from '@contexts/jobs/domain/repositories/jobs.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryJobsRepository implements IJobsRepository {
  private readonly jobs = new Map<string, Job>();

  async save(job: Job): Promise<void> {
    this.jobs.set(job.id, job);
  }

  async findById(id: string): Promise<Job | null> {
    return this.jobs.get(id) ?? null;
  }
}
