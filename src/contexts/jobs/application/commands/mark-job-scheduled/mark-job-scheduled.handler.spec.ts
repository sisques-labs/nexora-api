import { CreateJobCommand } from '@contexts/jobs/application/commands/create-job/create-job.command';
import { CreateJobCommandHandler } from '@contexts/jobs/application/commands/create-job/create-job.handler';
import { JobNotFoundException } from '@contexts/jobs/domain/exceptions/job-not-found.exception';
import { InMemoryJobsRepository } from '@contexts/jobs/infrastructure/repositories/in-memory-jobs.repository';

import { MarkJobScheduledCommand } from './mark-job-scheduled.command';
import { MarkJobScheduledCommandHandler } from './mark-job-scheduled.handler';

describe('MarkJobScheduledCommandHandler', () => {
  it('moves an existing job to scheduled, with the given node', async () => {
    const repository = new InMemoryJobsRepository();
    const job = await new CreateJobCommandHandler(repository).execute(
      new CreateJobCommand({ model: 'nexora-mock-llama-3.1-8b' }),
    );

    const snapshot = await new MarkJobScheduledCommandHandler(
      repository,
    ).execute(
      new MarkJobScheduledCommand({ jobId: job.id, nodeId: 'mock-node-1' }),
    );

    expect(snapshot.status).toBe('scheduled');
    expect(snapshot.nodeId).toBe('mock-node-1');
  });

  it('throws JobNotFoundException for an unknown job', async () => {
    const handler = new MarkJobScheduledCommandHandler(
      new InMemoryJobsRepository(),
    );

    await expect(
      handler.execute(
        new MarkJobScheduledCommand({
          jobId: 'unknown',
          nodeId: 'mock-node-1',
        }),
      ),
    ).rejects.toBeInstanceOf(JobNotFoundException);
  });
});
