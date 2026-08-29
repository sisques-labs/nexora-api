import { CreateJobCommand } from '@contexts/jobs/application/commands/create-job/create-job.command';
import { MarkJobCompletedCommand } from '@contexts/jobs/application/commands/mark-job-completed/mark-job-completed.command';
import { MarkJobFailedCommand } from '@contexts/jobs/application/commands/mark-job-failed/mark-job-failed.command';
import { MarkJobRunningCommand } from '@contexts/jobs/application/commands/mark-job-running/mark-job-running.command';
import { MarkJobScheduledCommand } from '@contexts/jobs/application/commands/mark-job-scheduled/mark-job-scheduled.command';
import { JobSnapshot } from '@contexts/jobs/application/dtos/job-snapshot.interface';
import { IJobsPort, JobRef } from '@contexts/chat/application/ports/jobs.port';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

/**
 * Translates chat's IJobsPort onto the jobs context's own commands,
 * dispatched through the shared CommandBus. Once nexora-jobs is a real
 * service, only this file changes (to an HTTP client) — chat's port,
 * handler and everything above it stay the same.
 */
@Injectable()
export class JobsAdapter implements IJobsPort {
  constructor(private readonly commandBus: CommandBus) {}

  async create(model: string): Promise<JobRef> {
    const job = await this.commandBus.execute<CreateJobCommand, JobSnapshot>(
      new CreateJobCommand({ model }),
    );
    return { id: job.id };
  }

  async markScheduled(jobId: string, nodeId: string): Promise<void> {
    await this.commandBus.execute(
      new MarkJobScheduledCommand({ jobId, nodeId }),
    );
  }

  async markRunning(jobId: string): Promise<void> {
    await this.commandBus.execute(new MarkJobRunningCommand({ jobId }));
  }

  async markCompleted(jobId: string): Promise<void> {
    await this.commandBus.execute(new MarkJobCompletedCommand({ jobId }));
  }

  async markFailed(jobId: string, cause: unknown): Promise<void> {
    await this.commandBus.execute(new MarkJobFailedCommand({ jobId, cause }));
  }
}
