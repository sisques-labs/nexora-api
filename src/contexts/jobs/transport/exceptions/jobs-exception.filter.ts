import { JobNotFoundException } from '@contexts/jobs/domain/exceptions/job-not-found.exception';
import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@sisques-labs/nestjs-kit';

export function resolveJobsExceptionStatus(
  exception: BaseException,
): HttpStatus | null {
  if (exception instanceof JobNotFoundException) {
    return HttpStatus.NOT_FOUND;
  }
  return null;
}
