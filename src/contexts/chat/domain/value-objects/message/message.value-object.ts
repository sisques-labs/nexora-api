import { RoleEnum } from '@contexts/chat/domain/enums/role.enum';
import { RoleValueObject } from '@contexts/chat/domain/value-objects/role/role.value-object';
import { StringValueObject, ValueObject } from '@sisques-labs/nestjs-kit';

export interface MessagePrimitives {
  role: RoleEnum;
  content: string;
}

/**
 * A conversation turn sent in the request. Composite value object — see
 * nestjs-kit's ValueObject base docs on multi-attribute VOs: each part
 * is its own private value object, `value` assembles the primitives.
 */
export class MessageValueObject extends ValueObject<MessagePrimitives> {
  public readonly role: RoleValueObject;
  public readonly content: StringValueObject;

  constructor(role: RoleEnum, content: string) {
    super();
    this.role = new RoleValueObject(role);
    this.content = new StringValueObject(content, { allowEmpty: false });
    this.validate();
  }

  public get value(): MessagePrimitives {
    return { role: this.role.value as RoleEnum, content: this.content.value };
  }

  protected validate(): void {
    // role and content each validate themselves in their own
    // constructors — nothing composite to check here yet.
  }
}
