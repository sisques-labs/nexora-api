import { NodeNotFoundException } from '@contexts/nodes/domain/exceptions/node-not-found.exception';
import { InMemoryNodesRepository } from '@contexts/nodes/infrastructure/repositories/in-memory-nodes.repository';

import { DispatchInferenceCommand } from './dispatch-inference.command';
import { DispatchInferenceCommandHandler } from './dispatch-inference.handler';

describe('DispatchInferenceCommandHandler', () => {
  it('echoes the prompt from the known mock node', async () => {
    const handler = new DispatchInferenceCommandHandler(
      new InMemoryNodesRepository(),
    );

    const completion = await handler.execute(
      new DispatchInferenceCommand({ nodeId: 'mock-node-1', prompt: 'hello' }),
    );

    expect(completion).toContain('mock-node-1');
    expect(completion).toContain('hello');
  });

  it('throws NodeNotFoundException for an unknown node', async () => {
    const handler = new DispatchInferenceCommandHandler(
      new InMemoryNodesRepository(),
    );

    await expect(
      handler.execute(
        new DispatchInferenceCommand({ nodeId: 'unknown', prompt: 'hi' }),
      ),
    ).rejects.toBeInstanceOf(NodeNotFoundException);
  });
});
