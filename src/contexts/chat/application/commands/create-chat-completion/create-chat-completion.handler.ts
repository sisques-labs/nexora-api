import {
  IJobsGateway,
  JOBS_GATEWAY,
} from '@contexts/chat/application/ports/jobs.gateway';
import {
  IModelsGateway,
  MODELS_GATEWAY,
} from '@contexts/chat/application/ports/models.gateway';
import {
  INodesGateway,
  NODES_GATEWAY,
} from '@contexts/chat/application/ports/nodes.gateway';
import {
  ISchedulerGateway,
  SCHEDULER_GATEWAY,
} from '@contexts/chat/application/ports/scheduler.gateway';
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
 * gateways.
 *
 * Doesn't extend nestjs-kit's BaseCommandHandler: that helper publishes
 * domain events off an AggregateRoot, and v0 has no event-sourced
 * aggregate to publish from (see JobAggregate's docstring).
 */
@CommandHandler(CreateChatCompletionCommand)
export class CreateChatCompletionCommandHandler implements ICommandHandler<
  CreateChatCompletionCommand,
  CreateChatCompletionResult
> {
  constructor(
    @Inject(MODELS_GATEWAY) private readonly modelsGateway: IModelsGateway,
    @Inject(JOBS_GATEWAY) private readonly jobsGateway: IJobsGateway,
    @Inject(SCHEDULER_GATEWAY)
    private readonly schedulerGateway: ISchedulerGateway,
    @Inject(NODES_GATEWAY) private readonly nodesGateway: INodesGateway,
  ) {}

  async execute(
    command: CreateChatCompletionCommand,
  ): Promise<CreateChatCompletionResult> {
    await this.modelsGateway.resolve(command.request.model.value);

    const job = await this.jobsGateway.create(command.request.model.value);

    let nodeId: string;
    try {
      nodeId = await this.schedulerGateway.selectNode(job);
    } catch (selectNodeFailure) {
      await this.jobsGateway.markFailed(job.id, selectNodeFailure);
      throw selectNodeFailure;
    }
    await this.jobsGateway.markScheduled(job.id, nodeId);
    await this.jobsGateway.markRunning(job.id);

    let result: ResultValueObject;
    try {
      result = await this.nodesGateway.dispatch(nodeId, command.request);
    } catch (dispatchFailure) {
      await this.jobsGateway.markFailed(job.id, dispatchFailure);
      throw dispatchFailure;
    }

    await this.jobsGateway.markCompleted(job.id);

    return { jobId: job.id, result };
  }
}
