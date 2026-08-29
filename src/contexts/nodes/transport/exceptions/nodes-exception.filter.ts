import { NodeNotFoundException } from '@contexts/nodes/domain/exceptions/node-not-found.exception';
import { NoNodeAvailableException } from '@contexts/nodes/domain/exceptions/no-node-available.exception';
import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@sisques-labs/nestjs-kit';

export function resolveNodesExceptionStatus(
  exception: BaseException,
): HttpStatus | null {
  if (
    exception instanceof NodeNotFoundException ||
    exception instanceof NoNodeAvailableException
  ) {
    return HttpStatus.NOT_FOUND;
  }
  return null;
}
