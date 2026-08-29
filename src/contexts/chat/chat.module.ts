import { CreateChatCompletionCommandHandler } from '@contexts/chat/application/commands/create-chat-completion/create-chat-completion.handler';
import { JOBS_PORT } from '@contexts/chat/application/ports/jobs.port';
import { MODELS_PORT } from '@contexts/chat/application/ports/models.port';
import { NODES_PORT } from '@contexts/chat/application/ports/nodes.port';
import { SCHEDULER_PORT } from '@contexts/chat/application/ports/scheduler.port';
import { JobsAdapter } from '@contexts/chat/infrastructure/adapters/jobs.adapter';
import { ModelsAdapter } from '@contexts/chat/infrastructure/adapters/models.adapter';
import { NodesAdapter } from '@contexts/chat/infrastructure/adapters/nodes.adapter';
import { SchedulerAdapter } from '@contexts/chat/infrastructure/adapters/scheduler.adapter';
import { ChatCompletionsController } from '@contexts/chat/transport/rest/controllers/chat-completions.controller';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

const COMMAND_HANDLERS = [CreateChatCompletionCommandHandler];

// Each adapter dispatches into its target context's own CommandBus/
// QueryBus (see infrastructure/adapters) — none of these are mocks
// anymore; the mocking lives one level down, in jobs/nodes/models'
// in-memory repositories.
const INFRASTRUCTURE_ADAPTERS = [
  { provide: JOBS_PORT, useClass: JobsAdapter },
  { provide: SCHEDULER_PORT, useClass: SchedulerAdapter },
  { provide: NODES_PORT, useClass: NodesAdapter },
  { provide: MODELS_PORT, useClass: ModelsAdapter },
];

const REST_CONTROLLERS = [ChatCompletionsController];

@Module({
  imports: [CqrsModule],
  controllers: [...REST_CONTROLLERS],
  providers: [...COMMAND_HANDLERS, ...INFRASTRUCTURE_ADAPTERS],
})
export class ChatModule {}
