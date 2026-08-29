import { CreateJobCommand } from '@contexts/jobs/application/commands/create-job/create-job.command';
import { CreateJobCommandHandler } from '@contexts/jobs/application/commands/create-job/create-job.handler';
import { JobNotFoundException } from '@contexts/jobs/domain/exceptions/job-not-found.exception';
import { InMemoryJobsRepository } from '@contexts/jobs/infrastructure/repositories/in-memory-jobs.repository';

import { MarkJobFailedCommand } from './mark-job-failed.command';
import { MarkJobFailedCommandHandler } from './mark-job-failed.handler';

describe('MarkJobFailedCommandHandler', () => {
  it('moves an existing job to failed', async () => {
    const repository = new InMemoryJobsRepository();
    const job = await new CreateJobCommandHandler(repository).execute(
      new CreateJobCommand({ model: 'nexora-mock-llama-3.1-8b' }),
    );

    const snapshot = await new MarkJobFailedCommandHandler(repository).execute(
      new MarkJobFailedCommand({ jobId: job.id, cause: new Error('boom') }),
    );

    expect(snapshot.status).toBe('failed');
  });

  it('throws JobNotFoundException for an unknown job', async () => {
    const handler = new MarkJobFailedCommandHandler(
      new InMemoryJobsRepository(),
    );

    await expect(
      handler.execute(new MarkJobFailedCommand({ jobId: 'unknown' })),
    ).rejects.toBeInstanceOf(JobNotFoundException);
  });
});
