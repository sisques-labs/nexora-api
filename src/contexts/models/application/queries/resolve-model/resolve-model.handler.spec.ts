import { ModelNotFoundException } from '@contexts/models/domain/exceptions/model-not-found.exception';
import { InMemoryModelsRepository } from '@contexts/models/infrastructure/repositories/in-memory-models.repository';

import { ResolveModelQuery } from './resolve-model.query';
import { ResolveModelQueryHandler } from './resolve-model.handler';

describe('ResolveModelQueryHandler', () => {
  it('resolves silently for the known mock model', async () => {
    const handler = new ResolveModelQueryHandler(
      new InMemoryModelsRepository(),
    );

    await expect(
      handler.execute(
        new ResolveModelQuery({ name: 'nexora-mock-llama-3.1-8b' }),
      ),
    ).resolves.toBeUndefined();
  });

  it('throws ModelNotFoundException for an unknown model', async () => {
    const handler = new ResolveModelQueryHandler(
      new InMemoryModelsRepository(),
    );

    await expect(
      handler.execute(new ResolveModelQuery({ name: 'unknown-model' })),
    ).rejects.toBeInstanceOf(ModelNotFoundException);
  });
});
