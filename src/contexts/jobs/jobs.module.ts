import { CreateJobCommandHandler } from '@contexts/jobs/application/commands/create-job/create-job.handler';
import { MarkJobCompletedCommandHandler } from '@contexts/jobs/application/commands/mark-job-completed/mark-job-completed.handler';
import { MarkJobFailedCommandHandler } from '@contexts/jobs/application/commands/mark-job-failed/mark-job-failed.handler';
import { MarkJobRunningCommandHandler } from '@contexts/jobs/application/commands/mark-job-running/mark-job-running.handler';
import { MarkJobScheduledCommandHandler } from '@contexts/jobs/application/commands/mark-job-scheduled/mark-job-scheduled.handler';
import { JOBS_REPOSITORY } from '@contexts/jobs/domain/repositories/jobs.repository';
import { InMemoryJobsRepository } from '@contexts/jobs/infrastructure/repositories/in-memory-jobs.repository';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

const COMMAND_HANDLERS = [
  CreateJobCommandHandler,
  MarkJobScheduledCommandHandler,
  MarkJobRunningCommandHandler,
  MarkJobCompletedCommandHandler,
  MarkJobFailedCommandHandler,
];

const INFRASTRUCTURE_REPOSITORIES = [
  { provide: JOBS_REPOSITORY, useClass: InMemoryJobsRepository },
];

// No REST controllers: nexora-jobs isn't part of nexora-api's public
// surface. It's reached only via CommandBus, from chat's
// infrastructure/adapters/jobs.adapter.ts today, and over HTTP from the
// real nexora-jobs service once it exists.
@Module({
  imports: [CqrsModule],
  providers: [...COMMAND_HANDLERS, ...INFRASTRUCTURE_REPOSITORIES],
})
export class JobsModule {}
