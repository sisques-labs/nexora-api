export const NODES_PORT = Symbol('NODES_PORT');

/**
 * scheduler's own anti-corruption seam to the nodes context — separate
 * from chat's INodesPort (chat/application/ports/nodes.port.ts). Each
 * context that needs another context's capability defines its own port;
 * they are never shared, even when their shape happens to overlap.
 */
export interface INodesPort {
  findAvailableNode(): Promise<string>;
}
