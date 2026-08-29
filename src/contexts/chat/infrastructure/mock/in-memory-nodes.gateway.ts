import { INodesGateway } from '@contexts/chat/application/ports/nodes.gateway';
import { NodeAggregate } from '@contexts/chat/domain/aggregates/node.aggregate';
import { FinishReasonEnum } from '@contexts/chat/domain/enums/finish-reason.enum';
import { RoleEnum } from '@contexts/chat/domain/enums/role.enum';
import { MessageValueObject } from '@contexts/chat/domain/value-objects/message/message.value-object';
import { RequestValueObject } from '@contexts/chat/domain/value-objects/request/request.value-object';
import { ResultValueObject } from '@contexts/chat/domain/value-objects/result/result.value-object';
import { Injectable } from '@nestjs/common';

/**
 * Stands in for nexora-nodes (and, transitively, the real nexora-agent):
 * instead of forwarding the request to a real agent, it generates a
 * canned response. It's the README's "fake agent".
 */
@Injectable()
export class InMemoryNodesGateway implements INodesGateway {
  private readonly node = new NodeAggregate('mock-node-1', {
    cpu: 'Apple M2',
    ramGb: 16,
    gpu: 'Apple M2 GPU (integrated)',
    vramGb: 0,
    runtime: 'llama.cpp (mock)',
  });

  /**
   * Exposes the single node available in v0, so the scheduler mock
   * knows who to route to without querying a real registry.
   */
  onlyNodeId(): string {
    return this.node.id;
  }

  async dispatch(
    nodeId: string,
    request: RequestValueObject,
  ): Promise<ResultValueObject> {
    if (nodeId !== this.node.id) {
      throw new Error(`node "${nodeId}" not found`);
    }

    const lastUserMessage =
      [...request.messages]
        .reverse()
        .find((message) => message.role.is(RoleEnum.USER))?.content.value ?? '';

    const reply = new MessageValueObject(
      RoleEnum.ASSISTANT,
      `[mock inference on ${this.node.id}] echo: ${lastUserMessage}`,
    );

    return new ResultValueObject(reply, FinishReasonEnum.STOP);
  }
}
