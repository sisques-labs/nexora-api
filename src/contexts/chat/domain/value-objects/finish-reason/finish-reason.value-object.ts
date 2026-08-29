import { FinishReasonEnum } from '@contexts/chat/domain/enums/finish-reason.enum';
import { EnumValueObject } from '@sisques-labs/nestjs-kit';

/**
 * Why the model stopped generating text.
 */
export class FinishReasonValueObject extends EnumValueObject<
  typeof FinishReasonEnum
> {
  constructor(value: FinishReasonEnum) {
    super(value);
  }

  protected get enumObject(): typeof FinishReasonEnum {
    return FinishReasonEnum as unknown as typeof FinishReasonEnum;
  }
}
