import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { resolveJobsExceptionStatus } from '@contexts/jobs/transport/exceptions/jobs-exception.filter';
import { resolveModelsExceptionStatus } from '@contexts/models/transport/exceptions/models-exception.filter';
import { resolveNodesExceptionStatus } from '@contexts/nodes/transport/exceptions/nodes-exception.filter';
import { BaseException } from '@sisques-labs/nestjs-kit';
import { Response } from 'express';

/**
 * Per-context HTTP status resolvers, registered here as bounded contexts
 * are added. Each function returns a status for the exceptions it
 * recognises, or `null` to let the next resolver (or the default) decide.
 * Same extension-point pattern as nestjs-template/gardenia-api. chat has
 * none of its own — it has no domain exceptions today (see AGENTS.md).
 */
const EXCEPTION_STATUS_RESOLVERS: Array<
  (exception: BaseException) => HttpStatus | null
> = [
  resolveModelsExceptionStatus,
  resolveJobsExceptionStatus,
  resolveNodesExceptionStatus,
];

/**
 * Catches everything (not just BaseException, unlike the template): any
 * unexpected error must still produce nexora-api's public error shape
 * (the OpenAI-compatible `{ error: { message, type } }` envelope), not
 * Nest's default one. A BaseException resolves to a specific status via
 * EXCEPTION_STATUS_RESOLVERS (defaulting to 400 — "the input was
 * invalid" is the overwhelmingly common case); anything else is a real
 * bug and stays a 500.
 */
@Catch()
export class BaseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = this.resolveStatus(exception);
    const message = this.resolveMessage(exception);
    const type =
      status === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'internal_error'
        : 'invalid_request_error';

    response.status(status).json({ error: { message, type } });
  }

  private resolveStatus(exception: unknown): HttpStatus {
    if (!(exception instanceof BaseException)) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
    for (const resolve of EXCEPTION_STATUS_RESOLVERS) {
      const status = resolve(exception);
      if (status !== null) {
        return status;
      }
    }
    return HttpStatus.BAD_REQUEST;
  }

  private resolveMessage(exception: unknown): string {
    return exception instanceof Error
      ? exception.message
      : 'internal server error';
  }
}
