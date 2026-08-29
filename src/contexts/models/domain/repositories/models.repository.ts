import { Model } from '@contexts/models/domain/aggregates/model.aggregate';

export const MODELS_REPOSITORY = Symbol('MODELS_REPOSITORY');

/**
 * models' own persistence contract. In-memory in v0 (see
 * infrastructure/repositories); a real one lands when nexora-models
 * picks up Postgres.
 */
export interface IModelsRepository {
  findByName(name: string): Promise<Model | null>;
  findAll(): Promise<Model[]>;
}
