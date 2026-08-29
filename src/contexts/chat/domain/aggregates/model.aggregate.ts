/**
 * An entry in the catalog of servable models. In v0 the catalog is a
 * single hardcoded model (nexora-models doesn't exist yet).
 */
export class ModelAggregate {
  constructor(public readonly name: string) {}
}
