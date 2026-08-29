import { InMemoryJobsRepository } from '@contexts/jobs/infrastructure/repositories/in-memory-jobs.repository';

import { CreateJobCommand } from './create-job.command';
import { CreateJobCommandHandler } from './create-job.handler';

describe('CreateJobCommandHandler', () => {
  it('creates a pending job for the given model', async () => {
    const handler = new CreateJobCommandHandler(new InMemoryJobsRepository());

    const snapshot = await handler.execute(
      new CreateJobCommand({ model: 'nexora-mock-llama-3.1-8b' }),
    );

    expect(snapshot.id).toBeTruthy();
    expect(snapshot.model).toBe('nexora-mock-llama-3.1-8b');
    expect(snapshot.status).toBe('pending');
    expect(snapshot.nodeId).toBeNull();
  });

  it('rejects an empty model', () => {
    expect(() => new CreateJobCommand({ model: '' })).toThrow();
  });
});
