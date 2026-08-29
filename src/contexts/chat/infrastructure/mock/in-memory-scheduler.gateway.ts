import { ISchedulerGateway } from '@contexts/chat/application/ports/scheduler.gateway';
import { JobAggregate } from '@contexts/chat/domain/aggregates/job.aggregate';
import { Injectable } from '@nestjs/common';

import { InMemoryNodesGateway } from './in-memory-nodes.gateway';

/**
 * Stands in for nexora-scheduler. In v0, with a single node registered,
 * there's no real decision to make: it's a direct router.
 *
 * Depends on the concrete InMemoryNodesGateway (not the INodesGateway
 * port) so Nest's DI wires the same relationship the Go/Java v0s built
 * by hand — onlyNodeId() isn't part of the port's public contract.
 */
@Injectable()
export class InMemorySchedulerGateway implements ISchedulerGateway {
  constructor(private readonly nodesGateway: InMemoryNodesGateway) {}

  async selectNode(_job: JobAggregate): Promise<string> {
    return this.nodesGateway.onlyNodeId();
  }
}
