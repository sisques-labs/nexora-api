import { InMemoryNodesRepository } from '@contexts/nodes/infrastructure/repositories/in-memory-nodes.repository';

import { FindAvailableNodeQuery } from './find-available-node.query';
import { FindAvailableNodeQueryHandler } from './find-available-node.handler';

describe('FindAvailableNodeQueryHandler', () => {
  it('returns the single mock node id', async () => {
    const handler = new FindAvailableNodeQueryHandler(
      new InMemoryNodesRepository(),
    );

    const nodeId = await handler.execute(new FindAvailableNodeQuery());

    expect(nodeId).toBe('mock-node-1');
  });
});
