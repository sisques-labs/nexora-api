import { BaseException } from '@sisques-labs/nestjs-kit';

/**
 * The requested model doesn't exist in the catalog. Owned by the
 * models context — not chat's, even though it's chat that triggers it
 * (via resolve-model.query.ts, dispatched from chat's models.adapter.ts).
 */
export class ModelNotFoundException extends BaseException {
  constructor(requestedModel: string, availableModel: string) {
    super(
      `model "${requestedModel}" not found, only "${availableModel}" is available in v0`,
    );
  }
}
