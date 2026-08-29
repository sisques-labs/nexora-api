import {
  MessagePrimitives,
  MessageValueObject,
} from '@contexts/chat/domain/value-objects/message/message.value-object';
import { InvalidInputException } from '@core/exceptions/invalid-input.exception';
import { StringValueObject, ValueObject } from '@sisques-labs/nestjs-kit';

export interface RequestPrimitives {
  model: string;
  messages: MessagePrimitives[];
}

/**
 * An already-validated inference request, independent of the HTTP
 * transport.
 */
export class RequestValueObject extends ValueObject<RequestPrimitives> {
  public readonly model: StringValueObject;
  public readonly messages: MessageValueObject[];

  constructor(model: string, messages: MessageValueObject[]) {
    super();
    this.model = new StringValueObject(model, { allowEmpty: false });
    this.messages = messages;
    this.validate();
  }

  public get value(): RequestPrimitives {
    return {
      model: this.model.value,
      messages: this.messages.map((message) => message.value),
    };
  }

  protected validate(): void {
    if (this.messages.length === 0) {
      throw new InvalidInputException('chat: messages must not be empty');
    }
  }
}
