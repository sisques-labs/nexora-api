import { randomUUID } from 'crypto';

import {
  JobSnapshot,
  toJobSnapshot,
} from '@contexts/jobs/application/dtos/job-snapshot.interface';
import { Job } from '@contexts/jobs/domain/aggregates/job.aggregate';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '@contexts/jobs/domain/repositories/jobs.repository';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateJobCommand } from './create-job.command';

@CommandHandler(CreateJobCommand)
export class CreateJobCommandHandler implements ICommandHandler<
  CreateJobCommand,
  JobSnapshot
> {
  constructor(
    @Inject(JOBS_REPOSITORY) private readonly jobsRepository: IJobsRepository,
  ) {}

  async execute(command: CreateJobCommand): Promise<JobSnapshot> {
    const job = Job.createdFor(randomUUID(), command.model, new Date());
    await this.jobsRepository.save(job);
    return toJobSnapshot(job);
  }
}
