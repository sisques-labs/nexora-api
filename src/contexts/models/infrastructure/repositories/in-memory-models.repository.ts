import { Model } from '@contexts/models/domain/aggregates/model.aggregate';
import { IModelsRepository } from '@contexts/models/domain/repositories/models.repository';
import { Injectable } from '@nestjs/common';

/**
 * Stands in for nexora-models: a hardcoded catalog of a single model,
 * until nexora-models exists.
 */
@Injectable()
export class InMemoryModelsRepository implements IModelsRepository {
  private readonly model = new Model('nexora-mock-llama-3.1-8b');

  async findByName(name: string): Promise<Model | null> {
    return this.model.name === name ? this.model : null;
  }

  async findAll(): Promise<Model[]> {
    return [this.model];
  }
}
