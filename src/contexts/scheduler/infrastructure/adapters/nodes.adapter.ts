import { INodesPort } from '@contexts/scheduler/application/ports/nodes.port';
import { FindAvailableNodeQuery } from '@contexts/nodes/application/queries/find-available-node/find-available-node.query';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

@Injectable()
export class NodesAdapter implements INodesPort {
  constructor(private readonly queryBus: QueryBus) {}

  async findAvailableNode(): Promise<string> {
    return this.queryBus.execute<FindAvailableNodeQuery, string>(
      new FindAvailableNodeQuery(),
    );
  }
}
