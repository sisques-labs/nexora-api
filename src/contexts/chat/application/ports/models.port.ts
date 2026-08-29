export const MODELS_PORT = Symbol('MODELS_PORT');

/**
 * Resolves whether a requested model exists in the catalog — throws if
 * not (see the models context's ModelNotFoundException, propagated
 * through unchanged). chat never needs the Model itself back, only the
 * confirmation.
 */
export interface IModelsPort {
  resolve(name: string): Promise<void>;
}
