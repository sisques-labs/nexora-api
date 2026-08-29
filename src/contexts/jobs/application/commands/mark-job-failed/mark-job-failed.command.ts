import { InvalidInputException } from '@core/exceptions/invalid-input.exception';

export interface MarkJobFailedCommandInput {
  jobId: string;
  cause?: unknown;
}

export class MarkJobFailedCommand {
  public readonly jobId: string;
  public readonly cause?: unknown;

  constructor(input: MarkJobFailedCommandInput) {
    if (!input.jobId) {
      throw new InvalidInputException('jobs: jobId must not be empty');
    }
    this.jobId = input.jobId;
    this.cause = input.cause;
  }
}
