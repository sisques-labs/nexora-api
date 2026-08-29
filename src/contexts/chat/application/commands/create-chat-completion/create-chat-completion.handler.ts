import {
  IJobsPort,
  JOBS_PORT,
} from '@contexts/chat/application/ports/jobs.port';
import {
  IModelsPort,
  MODELS_PORT,
} from '@contexts/chat/application/ports/models.port';
import {
  INodesPort,
  NODES_PORT,
} from '@contexts/chat/application/ports/nodes.port';
import {
  ISchedulerPort,
  SCHEDULER_PORT,
} from '@contexts/chat/application/ports/scheduler.port';
import { ResultValueObject } from '@contexts/chat/domain/value-objects/result/result.value-object';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateChatCompletionCommand } from './create-chat-completion.command';

export interface CreateChatCompletionResult {
  jobId: string;
  result: ResultValueObject;
}

/**
 * Orchestrates the v0 end-to-end flow described in the README: validates
 * the model, creates the job, asks the scheduler for a node, dispatches
 * the inference against that node and closes the job. None of these
 * pieces has business logic of its own here: it only coordinates the
 * ports.
 *
 * Doesn't extend nestjs-kit's BaseCommandHandler: that helper publishes
 * domain events off an AggregateRoot, and v0 has no event-sourced
 * aggregate to publish from — chat has none of its own (see
 * jobs.port.ts's docstring on why Job isn't one either).
 */
@CommandHandler(CreateChatCompletionCommand)
export class CreateChatCompletionCommandHandler implements ICommandHandler<
  CreateChatCompletionCommand,
  CreateChatCompletionResult
> {
  constructor(
    @Inject(MODELS_PORT) private readonly modelsPort: IModelsPort,
    @Inject(JOBS_PORT) private readonly jobsPort: IJobsPort,
    @Inject(SCHEDULER_PORT) private readonly schedulerPort: ISchedulerPort,
    @Inject(NODES_PORT) private readonly nodesPort: INodesPort,
  ) {}

  async execute(
    command: CreateChatCompletionCommand,
  ): Promise<CreateChatCompletionResult> {
    await this.modelsPort.resolve(command.request.model.value);

    const job = await this.jobsPort.create(command.request.model.value);

    let nodeId: string;
    try {
      nodeId = await this.schedulerPort.selectNode(
        job.id,
        command.request.model.value,
      );
    } catch (selectNodeFailure) {
      await this.jobsPort.markFailed(job.id, selectNodeFailure);
      throw selectNodeFailure;
    }
    await this.jobsPort.markScheduled(job.id, nodeId);
    await this.jobsPort.markRunning(job.id);

    let result: ResultValueObject;
    try {
      result = await this.nodesPort.dispatch(nodeId, command.request);
    } catch (dispatchFailure) {
      await this.jobsPort.markFailed(job.id, dispatchFailure);
      throw dispatchFailure;
    }

    await this.jobsPort.markCompleted(job.id);

    return { jobId: job.id, result };
  }
}
