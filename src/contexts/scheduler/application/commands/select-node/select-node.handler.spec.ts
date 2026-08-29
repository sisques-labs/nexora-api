import { INodesPort } from '@contexts/scheduler/application/ports/nodes.port';

import { SelectNodeCommand } from './select-node.command';
import { SelectNodeCommandHandler } from './select-node.handler';

class FakeNodesPort implements INodesPort {
  async findAvailableNode(): Promise<string> {
    return 'mock-node-1';
  }
}

describe('SelectNodeCommandHandler', () => {
  it('returns whatever node the nodes context reports as available', async () => {
    const handler = new SelectNodeCommandHandler(new FakeNodesPort());

    const nodeId = await handler.execute(
      new SelectNodeCommand({
        jobId: 'job-1',
        model: 'nexora-mock-llama-3.1-8b',
      }),
    );

    expect(nodeId).toBe('mock-node-1');
  });
});
