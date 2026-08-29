import { ResolveModelQueryHandler } from '@contexts/models/application/queries/resolve-model/resolve-model.handler';
import { MODELS_REPOSITORY } from '@contexts/models/domain/repositories/models.repository';
import { InMemoryModelsRepository } from '@contexts/models/infrastructure/repositories/in-memory-models.repository';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

const QUERY_HANDLERS = [ResolveModelQueryHandler];

const INFRASTRUCTURE_REPOSITORIES = [
  { provide: MODELS_REPOSITORY, useClass: InMemoryModelsRepository },
];

// No REST controllers: nexora-models isn't part of nexora-api's public
// surface — reached only via QueryBus, from chat's
// infrastructure/adapters/models.adapter.ts today.
@Module({
  imports: [CqrsModule],
  providers: [...QUERY_HANDLERS, ...INFRASTRUCTURE_REPOSITORIES],
})
export class ModelsModule {}
