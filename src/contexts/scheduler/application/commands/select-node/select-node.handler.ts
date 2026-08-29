import {
  INodesPort,
  NODES_PORT,
} from '@contexts/scheduler/application/ports/nodes.port';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SelectNodeCommand } from './select-node.command';

/**
 * Decides which node a job goes to. In v0, with a single node
 * registered, it's effectively a direct router, not a real decision —
 * it just asks the nodes context for whatever's available.
 */
@CommandHandler(SelectNodeCommand)
export class SelectNodeCommandHandler implements ICommandHandler<
  SelectNodeCommand,
  string
> {
  constructor(@Inject(NODES_PORT) private readonly nodesPort: INodesPort) {}

  async execute(_command: SelectNodeCommand): Promise<string> {
    return this.nodesPort.findAvailableNode();
  }
}
