import { InvalidInputException } from '@core/exceptions/invalid-input.exception';

export interface ResolveModelQueryInput {
  name: string;
}

export class ResolveModelQuery {
  public readonly name: string;

  constructor(input: ResolveModelQueryInput) {
    if (!input.name || input.name.trim() === '') {
      throw new InvalidInputException('models: name must not be empty');
    }
    this.name = input.name;
  }
}
