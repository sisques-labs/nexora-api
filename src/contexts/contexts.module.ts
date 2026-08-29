import { ChatModule } from '@contexts/chat/chat.module';
import { JobsModule } from '@contexts/jobs/jobs.module';
import { ModelsModule } from '@contexts/models/models.module';
import { NodesModule } from '@contexts/nodes/nodes.module';
import { SchedulerModule } from '@contexts/scheduler/scheduler.module';
import { Module } from '@nestjs/common';

// Register every bounded context module here as it's added. jobs, nodes,
// models and scheduler have no REST controllers of their own — they're
// reached only via CommandBus/QueryBus, from chat's (and scheduler's)
// infrastructure/adapters. They live here, in nexora-api, only until
// each becomes its own real service (see the root README) — at that
// point its module is deleted from here and chat's/scheduler's adapters
// become HTTP clients instead of CommandBus/QueryBus dispatches.
const CONTEXT_MODULES = [
  ChatModule,
  JobsModule,
  SchedulerModule,
  NodesModule,
  ModelsModule,
];

@Module({
  imports: [...CONTEXT_MODULES],
})
export class ContextsModule {}
