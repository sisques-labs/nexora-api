import { ModelNotFoundException } from '@contexts/models/domain/exceptions/model-not-found.exception';
import {
  IModelsRepository,
  MODELS_REPOSITORY,
} from '@contexts/models/domain/repositories/models.repository';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ResolveModelQuery } from './resolve-model.query';

@QueryHandler(ResolveModelQuery)
export class ResolveModelQueryHandler implements IQueryHandler<
  ResolveModelQuery,
  void
> {
  constructor(
    @Inject(MODELS_REPOSITORY)
    private readonly modelsRepository: IModelsRepository,
  ) {}

  async execute(query: ResolveModelQuery): Promise<void> {
    const model = await this.modelsRepository.findByName(query.name);
    if (model) {
      return;
    }

    const [availableModel] = await this.modelsRepository.findAll();
    throw new ModelNotFoundException(
      query.name,
      availableModel?.name ?? 'none',
    );
  }
}
