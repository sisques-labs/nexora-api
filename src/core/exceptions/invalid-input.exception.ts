import { BaseException } from '@sisques-labs/nestjs-kit';

/**
 * A composite value object's own business rule failed validation (e.g.
 * "messages must not be empty") — as opposed to a single-field failure,
 * which nestjs-kit's own value object exceptions
 * (InvalidStringException, InvalidEnumValueException, ...) already
 * cover. Falls through BaseExceptionFilter's per-context resolvers to
 * its default — HTTP 400 — since no context needs a different status
 * for "the input was invalid".
 */
export class InvalidInputException extends BaseException {
  constructor(message: string) {
    super(message);
  }
}
