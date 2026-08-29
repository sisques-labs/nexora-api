import { NodeNotFoundException } from '@contexts/nodes/domain/exceptions/node-not-found.exception';
import {
  INodesRepository,
  NODES_REPOSITORY,
} from '@contexts/nodes/domain/repositories/nodes.repository';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DispatchInferenceCommand } from './dispatch-inference.command';

/**
 * The README's "fake agent": generates a canned completion instead of
 * forwarding to a real nexora-agent over llama.cpp.
 */
@CommandHandler(DispatchInferenceCommand)
export class DispatchInferenceCommandHandler implements ICommandHandler<
  DispatchInferenceCommand,
  string
> {
  constructor(
    @Inject(NODES_REPOSITORY)
    private readonly nodesRepository: INodesRepository,
  ) {}

  async execute(command: DispatchInferenceCommand): Promise<string> {
    const node = await this.nodesRepository.findById(command.nodeId);
    if (!node) {
      throw new NodeNotFoundException(command.nodeId);
    }
    return `[mock inference on ${node.id}] echo: ${command.prompt}`;
  }
}
