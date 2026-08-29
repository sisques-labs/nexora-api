import { ModelNotFoundException } from '@contexts/chat/domain/exceptions/model-not-found.exception';
import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@sisques-labs/nestjs-kit';

export function resolveChatExceptionStatus(
  exception: BaseException,
): HttpStatus | null {
  if (exception instanceof ModelNotFoundException) {
    return HttpStatus.NOT_FOUND;
  }
  return null;
}
