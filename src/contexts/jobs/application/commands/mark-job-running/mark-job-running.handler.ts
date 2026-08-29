import {
  JobSnapshot,
  toJobSnapshot,
} from '@contexts/jobs/application/dtos/job-snapshot.interface';
import { JobNotFoundException } from '@contexts/jobs/domain/exceptions/job-not-found.exception';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '@contexts/jobs/domain/repositories/jobs.repository';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { MarkJobRunningCommand } from './mark-job-running.command';

@CommandHandler(MarkJobRunningCommand)
export class MarkJobRunningCommandHandler implements ICommandHandler<
  MarkJobRunningCommand,
  JobSnapshot
> {
  constructor(
    @Inject(JOBS_REPOSITORY) private readonly jobsRepository: IJobsRepository,
  ) {}

  async execute(command: MarkJobRunningCommand): Promise<JobSnapshot> {
    const job = await this.jobsRepository.findById(command.jobId);
    if (!job) {
      throw new JobNotFoundException(command.jobId);
    }
    const runningJob = job.markRunning();
    await this.jobsRepository.save(runningJob);
    return toJobSnapshot(runningJob);
  }
}
