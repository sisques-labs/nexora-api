import { CreateChatCompletionCommandHandler } from '@contexts/chat/application/commands/create-chat-completion/create-chat-completion.handler';
import { JOBS_GATEWAY } from '@contexts/chat/application/ports/jobs.gateway';
import { MODELS_GATEWAY } from '@contexts/chat/application/ports/models.gateway';
import { NODES_GATEWAY } from '@contexts/chat/application/ports/nodes.gateway';
import { SCHEDULER_GATEWAY } from '@contexts/chat/application/ports/scheduler.gateway';
import { InMemoryJobsGateway } from '@contexts/chat/infrastructure/mock/in-memory-jobs.gateway';
import { InMemoryModelsGateway } from '@contexts/chat/infrastructure/mock/in-memory-models.gateway';
import { InMemoryNodesGateway } from '@contexts/chat/infrastructure/mock/in-memory-nodes.gateway';
import { InMemorySchedulerGateway } from '@contexts/chat/infrastructure/mock/in-memory-scheduler.gateway';
import { ChatCompletionsController } from '@contexts/chat/transport/rest/controllers/chat-completions.controller';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

const COMMAND_HANDLERS = [CreateChatCompletionCommandHandler];

// Bound to the concrete in-memory implementations for v0 (see
// infrastructure/mock). Swap each `useClass` for a real HTTP client once
// its service (nexora-jobs, nexora-scheduler, nexora-nodes, nexora-models)
// exists — nothing outside this module needs to change.
const INFRASTRUCTURE_GATEWAYS = [
  { provide: JOBS_GATEWAY, useClass: InMemoryJobsGateway },
  { provide: SCHEDULER_GATEWAY, useClass: InMemorySchedulerGateway },
  { provide: NODES_GATEWAY, useClass: InMemoryNodesGateway },
  { provide: MODELS_GATEWAY, useClass: InMemoryModelsGateway },
  // InMemorySchedulerGateway depends on the concrete InMemoryNodesGateway
  // (not the NODES_GATEWAY token — see its docstring), so it needs its
  // own binding too.
  InMemoryNodesGateway,
];

const REST_CONTROLLERS = [ChatCompletionsController];

@Module({
  imports: [CqrsModule],
  controllers: [...REST_CONTROLLERS],
  providers: [...COMMAND_HANDLERS, ...INFRASTRUCTURE_GATEWAYS],
})
export class ChatModule {}
