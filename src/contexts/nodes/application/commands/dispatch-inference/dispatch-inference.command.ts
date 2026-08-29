import { InvalidInputException } from '@core/exceptions/invalid-input.exception';

export interface DispatchInferenceCommandInput {
  nodeId: string;
  prompt: string;
}

/**
 * Deals only in primitives (a raw prompt string in, a raw completion
 * string out) — chat's own request/response shape (RequestValueObject,
 * ResultValueObject) is chat's domain, not nodes'. Translating between
 * the two is chat's infrastructure/adapters/nodes.adapter.ts's job.
 */
export class DispatchInferenceCommand {
  public readonly nodeId: string;
  public readonly prompt: string;

  constructor(input: DispatchInferenceCommandInput) {
    if (!input.nodeId) {
      throw new InvalidInputException('nodes: nodeId must not be empty');
    }
    this.nodeId = input.nodeId;
    this.prompt = input.prompt;
  }
}
