import { SelectNodeCommandHandler } from '@contexts/scheduler/application/commands/select-node/select-node.handler';
import { NODES_PORT } from '@contexts/scheduler/application/ports/nodes.port';
import { NodesAdapter } from '@contexts/scheduler/infrastructure/adapters/nodes.adapter';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

const COMMAND_HANDLERS = [SelectNodeCommandHandler];

const INFRASTRUCTURE_ADAPTERS = [
  { provide: NODES_PORT, useClass: NodesAdapter },
];

// No REST controllers: nexora-scheduler isn't part of nexora-api's
// public surface — reached only via CommandBus, from chat's
// infrastructure/adapters/scheduler.adapter.ts today.
@Module({
  imports: [CqrsModule],
  providers: [...COMMAND_HANDLERS, ...INFRASTRUCTURE_ADAPTERS],
})
export class SchedulerModule {}
