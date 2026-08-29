import { InvalidInputException } from '@core/exceptions/invalid-input.exception';

export interface MarkJobRunningCommandInput {
  jobId: string;
}

export class MarkJobRunningCommand {
  public readonly jobId: string;

  constructor(input: MarkJobRunningCommandInput) {
    if (!input.jobId) {
      throw new InvalidInputException('jobs: jobId must not be empty');
    }
    this.jobId = input.jobId;
  }
}
