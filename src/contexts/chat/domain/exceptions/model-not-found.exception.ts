import { BaseException } from '@sisques-labs/nestjs-kit';

/**
 * The requested model doesn't exist in the catalog.
 */
export class ModelNotFoundException extends BaseException {
  constructor(requestedModel: string, availableModel: string) {
    super(
      `model "${requestedModel}" not found, only "${availableModel}" is available in v0`,
    );
  }
}
