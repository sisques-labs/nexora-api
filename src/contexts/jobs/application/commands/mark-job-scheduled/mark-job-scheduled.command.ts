import { InvalidInputException } from '@core/exceptions/invalid-input.exception';

export interface MarkJobScheduledCommandInput {
  jobId: string;
  nodeId: string;
}

export class MarkJobScheduledCommand {
  public readonly jobId: string;
  public readonly nodeId: string;

  constructor(input: MarkJobScheduledCommandInput) {
    if (!input.jobId) {
      throw new InvalidInputException('jobs: jobId must not be empty');
    }
    if (!input.nodeId) {
      throw new InvalidInputException('jobs: nodeId must not be empty');
    }
    this.jobId = input.jobId;
    this.nodeId = input.nodeId;
  }
}
