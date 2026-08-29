import { Node } from '@contexts/nodes/domain/aggregates/node.aggregate';

export const NODES_REPOSITORY = Symbol('NODES_REPOSITORY');

/**
 * nodes' own persistence contract. In-memory in v0 (see
 * infrastructure/repositories); a real one lands when nexora-nodes
 * picks up Postgres.
 */
export interface INodesRepository {
  findById(id: string): Promise<Node | null>;
  findFirstAvailable(): Promise<Node | null>;
}
