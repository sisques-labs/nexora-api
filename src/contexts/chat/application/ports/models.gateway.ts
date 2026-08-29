import { ModelAggregate } from '@contexts/chat/domain/aggregates/model.aggregate';

export const MODELS_GATEWAY = Symbol('MODELS_GATEWAY');

/**
 * Resolves whether a requested model exists in the catalog. Today it's
 * implemented by infrastructure/mock; tomorrow an HTTP client to
 * nexora-models, without the application layer changing.
 */
export interface IModelsGateway {
  resolve(name: string): Promise<ModelAggregate>;
}
