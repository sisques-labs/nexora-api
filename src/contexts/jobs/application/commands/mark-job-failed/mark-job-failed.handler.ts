import {
  JobSnapshot,
  toJobSnapshot,
} from '@contexts/jobs/application/dtos/job-snapshot.interface';
import { JobNotFoundException } from '@contexts/jobs/domain/exceptions/job-not-found.exception';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '@contexts/jobs/domain/repositories/jobs.repository';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { MarkJobFailedCommand } from './mark-job-failed.command';

@CommandHandler(MarkJobFailedCommand)
export class MarkJobFailedCommandHandler implements ICommandHandler<
  MarkJobFailedCommand,
  JobSnapshot
> {
  private readonly logger = new Logger(MarkJobFailedCommandHandler.name);

  constructor(
    @Inject(JOBS_REPOSITORY) private readonly jobsRepository: IJobsRepository,
  ) {}

  async execute(command: MarkJobFailedCommand): Promise<JobSnapshot> {
    const job = await this.jobsRepository.findById(command.jobId);
    if (!job) {
      throw new JobNotFoundException(command.jobId);
    }
    if (command.cause) {
      this.logger.warn(`job ${command.jobId} failed: ${String(command.cause)}`);
    }
    const failedJob = job.markFailed();
    await this.jobsRepository.save(failedJob);
    return toJobSnapshot(failedJob);
  }
}
