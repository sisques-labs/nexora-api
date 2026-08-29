import { Node } from '@contexts/nodes/domain/aggregates/node.aggregate';
import { INodesRepository } from '@contexts/nodes/domain/repositories/nodes.repository';
import { Injectable } from '@nestjs/common';

/**
 * Stands in for nexora-nodes: a hardcoded single registered node, until
 * nexora-nodes exists. It's the README's "fake agent" registry — the
 * node itself is fake, not just the storage.
 */
@Injectable()
export class InMemoryNodesRepository implements INodesRepository {
  private readonly node = new Node('mock-node-1', {
    cpu: 'Apple M2',
    ramGb: 16,
    gpu: 'Apple M2 GPU (integrated)',
    vramGb: 0,
    runtime: 'llama.cpp (mock)',
  });

  async findById(id: string): Promise<Node | null> {
    return this.node.id === id ? this.node : null;
  }

  async findFirstAvailable(): Promise<Node | null> {
    return this.node;
  }
}
