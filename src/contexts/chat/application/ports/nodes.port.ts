import { RequestValueObject } from '@contexts/chat/domain/value-objects/request/request.value-object';
import { ResultValueObject } from '@contexts/chat/domain/value-objects/result/result.value-object';

export const NODES_PORT = Symbol('NODES_PORT');

/**
 * Runs the inference against the given node. request/ResultValueObject
 * are chat's own domain — the nodes context deals only in a raw prompt/
 * completion string; translating between the two is this port's
 * adapter's job, not the nodes context's.
 */
export interface INodesPort {
  dispatch(
    nodeId: string,
    request: RequestValueObject,
  ): Promise<ResultValueObject>;
}
