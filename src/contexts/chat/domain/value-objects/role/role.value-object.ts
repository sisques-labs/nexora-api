import { RoleEnum } from '@contexts/chat/domain/enums/role.enum';
import { EnumValueObject } from '@sisques-labs/nestjs-kit';

/**
 * Who is speaking within a conversation turn.
 */
export class RoleValueObject extends EnumValueObject<typeof RoleEnum> {
  constructor(value: RoleEnum) {
    super(value);
  }

  protected get enumObject(): typeof RoleEnum {
    return RoleEnum as unknown as typeof RoleEnum;
  }
}
