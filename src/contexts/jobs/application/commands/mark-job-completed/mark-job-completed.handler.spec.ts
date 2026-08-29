import { CreateJobCommand } from '@contexts/jobs/application/commands/create-job/create-job.command';
import { CreateJobCommandHandler } from '@contexts/jobs/application/commands/create-job/create-job.handler';
import { JobNotFoundException } from '@contexts/jobs/domain/exceptions/job-not-found.exception';
import { InMemoryJobsRepository } from '@contexts/jobs/infrastructure/repositories/in-memory-jobs.repository';

import { MarkJobCompletedCommand } from './mark-job-completed.command';
import { MarkJobCompletedCommandHandler } from './mark-job-completed.handler';

describe('MarkJobCompletedCommandHandler', () => {
  it('moves an existing job to completed', async () => {
    const repository = new InMemoryJobsRepository();
    const job = await new CreateJobCommandHandler(repository).execute(
      new CreateJobCommand({ model: 'nexora-mock-llama-3.1-8b' }),
    );

    const snapshot = await new MarkJobCompletedCommandHandler(
      repository,
    ).execute(new MarkJobCompletedCommand({ jobId: job.id }));

    expect(snapshot.status).toBe('completed');
  });

  it('throws JobNotFoundException for an unknown job', async () => {
    const handler = new MarkJobCompletedCommandHandler(
      new InMemoryJobsRepository(),
    );

    await expect(
      handler.execute(new MarkJobCompletedCommand({ jobId: 'unknown' })),
    ).rejects.toBeInstanceOf(JobNotFoundException);
  });
});
