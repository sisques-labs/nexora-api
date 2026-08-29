import { InvalidInputException } from '@core/exceptions/invalid-input.exception';

export interface CreateJobCommandInput {
  model: string;
}

export class CreateJobCommand {
  public readonly model: string;

  constructor(input: CreateJobCommandInput) {
    if (!input.model || input.model.trim() === '') {
      throw new InvalidInputException('jobs: model must not be empty');
    }
    this.model = input.model;
  }
}
