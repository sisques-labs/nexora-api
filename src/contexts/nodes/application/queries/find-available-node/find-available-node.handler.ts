import { NoNodeAvailableException } from '@contexts/nodes/domain/exceptions/no-node-available.exception';
import {
  INodesRepository,
  NODES_REPOSITORY,
} from '@contexts/nodes/domain/repositories/nodes.repository';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { FindAvailableNodeQuery } from './find-available-node.query';

/**
 * In v0, with a single node registered, this is a direct lookup, not a
 * real scheduling decision — see the scheduler context, which is the
 * one that actually gets called "the scheduler".
 */
@QueryHandler(FindAvailableNodeQuery)
export class FindAvailableNodeQueryHandler implements IQueryHandler<
  FindAvailableNodeQuery,
  string
> {
  constructor(
    @Inject(NODES_REPOSITORY)
    private readonly nodesRepository: INodesRepository,
  ) {}

  async execute(_query: FindAvailableNodeQuery): Promise<string> {
    const node = await this.nodesRepository.findFirstAvailable();
    if (!node) {
      throw new NoNodeAvailableException();
    }
    return node.id;
  }
}
