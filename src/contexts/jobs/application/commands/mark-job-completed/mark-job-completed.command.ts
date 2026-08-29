import { InvalidInputException } from '@core/exceptions/invalid-input.exception';

export interface MarkJobCompletedCommandInput {
  jobId: string;
}

export class MarkJobCompletedCommand {
  public readonly jobId: string;

  constructor(input: MarkJobCompletedCommandInput) {
    if (!input.jobId) {
      throw new InvalidInputException('jobs: jobId must not be empty');
    }
    this.jobId = input.jobId;
  }
}
