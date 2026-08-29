import { DispatchInferenceCommandHandler } from '@contexts/nodes/application/commands/dispatch-inference/dispatch-inference.handler';
import { FindAvailableNodeQueryHandler } from '@contexts/nodes/application/queries/find-available-node/find-available-node.handler';
import { NODES_REPOSITORY } from '@contexts/nodes/domain/repositories/nodes.repository';
import { InMemoryNodesRepository } from '@contexts/nodes/infrastructure/repositories/in-memory-nodes.repository';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

const COMMAND_HANDLERS = [DispatchInferenceCommandHandler];
const QUERY_HANDLERS = [FindAvailableNodeQueryHandler];

const INFRASTRUCTURE_REPOSITORIES = [
  { provide: NODES_REPOSITORY, useClass: InMemoryNodesRepository },
];

// No REST controllers: nexora-nodes isn't part of nexora-api's public
// surface — reached only via CommandBus/QueryBus, from chat's and
// scheduler's infrastructure/adapters today.
@Module({
  imports: [CqrsModule],
  providers: [
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...INFRASTRUCTURE_REPOSITORIES,
  ],
})
export class NodesModule {}
