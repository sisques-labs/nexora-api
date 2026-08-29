import { RequestValueObject } from '@contexts/chat/domain/value-objects/request/request.value-object';
import { ResultValueObject } from '@contexts/chat/domain/value-objects/result/result.value-object';

export const NODES_GATEWAY = Symbol('NODES_GATEWAY');

/**
 * Resolves the node/agent that will handle the job and runs the
 * inference against it. In v0 this includes simulating the agent (the
 * "fake agent"); in the future nexora-nodes will bridge to the real
 * nexora-agent.
 */
export interface INodesGateway {
  dispatch(
    nodeId: string,
    request: RequestValueObject,
  ): Promise<ResultValueObject>;
}
