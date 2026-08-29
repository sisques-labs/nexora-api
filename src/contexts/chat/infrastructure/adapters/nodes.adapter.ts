import { DispatchInferenceCommand } from '@contexts/nodes/application/commands/dispatch-inference/dispatch-inference.command';
import { INodesPort } from '@contexts/chat/application/ports/nodes.port';
import { FinishReasonEnum } from '@contexts/chat/domain/enums/finish-reason.enum';
import { RoleEnum } from '@contexts/chat/domain/enums/role.enum';
import { MessageValueObject } from '@contexts/chat/domain/value-objects/message/message.value-object';
import { RequestValueObject } from '@contexts/chat/domain/value-objects/request/request.value-object';
import { ResultValueObject } from '@contexts/chat/domain/value-objects/result/result.value-object';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

/**
 * Translates chat's INodesPort onto the nodes context's own command,
 * dispatched through the shared CommandBus — and translates both ways:
 * chat's RequestValueObject down to a raw prompt string on the way in,
 * nodes' raw completion string back up to a ResultValueObject on the
 * way out. The nodes context never sees chat's value objects.
 */
@Injectable()
export class NodesAdapter implements INodesPort {
  constructor(private readonly commandBus: CommandBus) {}

  async dispatch(
    nodeId: string,
    request: RequestValueObject,
  ): Promise<ResultValueObject> {
    const lastUserMessage =
      [...request.messages]
        .reverse()
        .find((message) => message.role.is(RoleEnum.USER))?.content.value ?? '';

    const completion = await this.commandBus.execute<
      DispatchInferenceCommand,
      string
    >(new DispatchInferenceCommand({ nodeId, prompt: lastUserMessage }));

    const reply = new MessageValueObject(RoleEnum.ASSISTANT, completion);
    return new ResultValueObject(reply, FinishReasonEnum.STOP);
  }
}
