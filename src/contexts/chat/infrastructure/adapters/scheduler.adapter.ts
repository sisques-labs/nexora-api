import { SelectNodeCommand } from '@contexts/scheduler/application/commands/select-node/select-node.command';
import { ISchedulerPort } from '@contexts/chat/application/ports/scheduler.port';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

/**
 * Translates chat's ISchedulerPort onto the scheduler context's own
 * command, dispatched through the shared CommandBus.
 */
@Injectable()
export class SchedulerAdapter implements ISchedulerPort {
  constructor(private readonly commandBus: CommandBus) {}

  async selectNode(jobId: string, model: string): Promise<string> {
    return this.commandBus.execute<SelectNodeCommand, string>(
      new SelectNodeCommand({ jobId, model }),
    );
  }
}
