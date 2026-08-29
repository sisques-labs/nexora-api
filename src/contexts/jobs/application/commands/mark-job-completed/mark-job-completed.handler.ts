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

import { MarkJobCompletedCommand } from './mark-job-completed.command';

@CommandHandler(MarkJobCompletedCommand)
export class MarkJobCompletedCommandHandler implements ICommandHandler<
  MarkJobCompletedCommand,
  JobSnapshot
> {
  constructor(
    @Inject(JOBS_REPOSITORY) private readonly jobsRepository: IJobsRepository,
  ) {}

  async execute(command: MarkJobCompletedCommand): Promise<JobSnapshot> {
    const job = await this.jobsRepository.findById(command.jobId);
    if (!job) {
      throw new JobNotFoundException(command.jobId);
    }
    const completedJob = job.markCompleted();
    await this.jobsRepository.save(completedJob);
    return toJobSnapshot(completedJob);
  }
}
