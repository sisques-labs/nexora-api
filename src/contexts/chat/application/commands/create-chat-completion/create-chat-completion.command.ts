import { RoleEnum } from '@contexts/chat/domain/enums/role.enum';
import { MessageValueObject } from '@contexts/chat/domain/value-objects/message/message.value-object';
import { RequestValueObject } from '@contexts/chat/domain/value-objects/request/request.value-object';

export interface CreateChatCompletionCommandInput {
  model: string;
  messages: { role: string; content: string }[];
}

/**
 * The (only, in v0) write command of the chat context: it enters as
 * POST /v1/chat/completions.
 */
export class CreateChatCompletionCommand {
  public readonly request: RequestValueObject;

  constructor(input: CreateChatCompletionCommandInput) {
    const messages = input.messages.map(
      (message) =>
        new MessageValueObject(message.role as RoleEnum, message.content),
    );
    this.request = new RequestValueObject(input.model, messages);
  }
}
