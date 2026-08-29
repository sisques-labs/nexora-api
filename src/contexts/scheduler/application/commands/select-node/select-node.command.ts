import { InvalidInputException } from '@core/exceptions/invalid-input.exception';

export interface SelectNodeCommandInput {
  jobId: string;
  model: string;
}

/**
 * In v0, with a single node registered, there's no real decision to
 * make — see SelectNodeCommandHandler. model is carried through anyway:
 * a real scheduler needs it to match node capability to job, and taking
 * it from day one means the command's shape doesn't change once
 * scheduling logic actually exists.
 */
export class SelectNodeCommand {
  public readonly jobId: string;
  public readonly model: string;

  constructor(input: SelectNodeCommandInput) {
    if (!input.jobId) {
      throw new InvalidInputException('scheduler: jobId must not be empty');
    }
    if (!input.model) {
      throw new InvalidInputException('scheduler: model must not be empty');
    }
    this.jobId = input.jobId;
    this.model = input.model;
  }
}
