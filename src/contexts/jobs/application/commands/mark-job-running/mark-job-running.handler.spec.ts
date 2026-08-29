import { CreateJobCommand } from '@contexts/jobs/application/commands/create-job/create-job.command';
import { CreateJobCommandHandler } from '@contexts/jobs/application/commands/create-job/create-job.handler';
import { JobNotFoundException } from '@contexts/jobs/domain/exceptions/job-not-found.exception';
import { InMemoryJobsRepository } from '@contexts/jobs/infrastructure/repositories/in-memory-jobs.repository';

import { MarkJobRunningCommand } from './mark-job-running.command';
import { MarkJobRunningCommandHandler } from './mark-job-running.handler';

describe('MarkJobRunningCommandHandler', () => {
  it('moves an existing job to running', async () => {
    const repository = new InMemoryJobsRepository();
    const job = await new CreateJobCommandHandler(repository).execute(
      new CreateJobCommand({ model: 'nexora-mock-llama-3.1-8b' }),
    );

    const snapshot = await new MarkJobRunningCommandHandler(repository).execute(
      new MarkJobRunningCommand({ jobId: job.id }),
    );

    expect(snapshot.status).toBe('running');
  });

  it('throws JobNotFoundException for an unknown job', async () => {
    const handler = new MarkJobRunningCommandHandler(
      new InMemoryJobsRepository(),
    );

    await expect(
      handler.execute(new MarkJobRunningCommand({ jobId: 'unknown' })),
    ).rejects.toBeInstanceOf(JobNotFoundException);
  });
});
