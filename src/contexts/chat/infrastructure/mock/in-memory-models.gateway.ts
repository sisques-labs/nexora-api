import { IModelsGateway } from '@contexts/chat/application/ports/models.gateway';
import { ModelAggregate } from '@contexts/chat/domain/aggregates/model.aggregate';
import { ModelNotFoundException } from '@contexts/chat/domain/exceptions/model-not-found.exception';
import { Injectable } from '@nestjs/common';

/**
 * Stands in for nexora-models: a hardcoded catalog of a single model,
 * until nexora-models exists.
 */
@Injectable()
export class InMemoryModelsGateway implements IModelsGateway {
  private readonly model = new ModelAggregate('nexora-mock-llama-3.1-8b');

  async resolve(name: string): Promise<ModelAggregate> {
    if (this.model.name !== name) {
      throw new ModelNotFoundException(name, this.model.name);
    }
    return this.model;
  }
}
