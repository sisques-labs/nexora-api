import { ResolveModelQuery } from '@contexts/models/application/queries/resolve-model/resolve-model.query';
import { IModelsPort } from '@contexts/chat/application/ports/models.port';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

/**
 * Translates chat's IModelsPort onto the models context's own query,
 * dispatched through the shared QueryBus. ModelNotFoundException
 * propagates through unchanged — BaseExceptionFilter maps it via
 * models' own resolveModelsExceptionStatus.
 */
@Injectable()
export class ModelsAdapter implements IModelsPort {
  constructor(private readonly queryBus: QueryBus) {}

  async resolve(name: string): Promise<void> {
    await this.queryBus.execute(new ResolveModelQuery({ name }));
  }
}
