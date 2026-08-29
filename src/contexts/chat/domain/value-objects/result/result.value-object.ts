import { FinishReasonEnum } from '@contexts/chat/domain/enums/finish-reason.enum';
import { FinishReasonValueObject } from '@contexts/chat/domain/value-objects/finish-reason/finish-reason.value-object';
import {
  MessagePrimitives,
  MessageValueObject,
} from '@contexts/chat/domain/value-objects/message/message.value-object';
import { ValueObject } from '@sisques-labs/nestjs-kit';

export interface ResultPrimitives {
  message: MessagePrimitives;
  finishReason: FinishReasonEnum;
}

/**
 * The full inference response (no streaming in v0).
 */
export class ResultValueObject extends ValueObject<ResultPrimitives> {
  public readonly message: MessageValueObject;
  public readonly finishReason: FinishReasonValueObject;

  constructor(message: MessageValueObject, finishReason: FinishReasonEnum) {
    super();
    this.message = message;
    this.finishReason = new FinishReasonValueObject(finishReason);
    this.validate();
  }

  public get value(): ResultPrimitives {
    return {
      message: this.message.value,
      finishReason: this.finishReason.value as FinishReasonEnum,
    };
  }

  protected validate(): void {
    // message and finishReason each validate themselves in their own
    // constructors — nothing composite to check here yet.
  }
}
