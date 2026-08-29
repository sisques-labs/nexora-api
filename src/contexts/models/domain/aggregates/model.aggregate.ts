/**
 * An entry in the catalog of servable models. This is the ONE context
 * that owns the model catalog. In v0 the catalog is a single hardcoded
 * model (nexora-models doesn't exist yet).
 */
export class Model {
  constructor(public readonly name: string) {}
}
