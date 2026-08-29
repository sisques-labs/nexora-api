import { JobStatusEnum } from '@contexts/chat/domain/enums/job-status.enum';

/**
 * An inference request in progress, as seen by nexora-api. The source
 * of truth for this aggregate lives in nexora-jobs; here it's just the
 * domain type the use case orchestrates with.
 *
 * Not a nestjs-kit BaseAggregate: v0 has no event sourcing (nothing
 * here is actually persisted or emits domain events yet — see
 * infrastructure/mock). Immutable by design: a transition (markScheduled,
 * markRunning, ...) returns a new JobAggregate rather than mutating this
 * one.
 */
export class JobAggregate {
  constructor(
    public readonly id: string,
    public readonly model: string,
    public readonly status: JobStatusEnum,
    public readonly nodeId: string | null,
    public readonly createdAt: Date,
  ) {}

  static createdFor(id: string, model: string, createdAt: Date): JobAggregate {
    return new JobAggregate(id, model, JobStatusEnum.PENDING, null, createdAt);
  }

  markScheduled(nodeId: string): JobAggregate {
    return new JobAggregate(
      this.id,
      this.model,
      JobStatusEnum.SCHEDULED,
      nodeId,
      this.createdAt,
    );
  }

  markRunning(): JobAggregate {
    return new JobAggregate(
      this.id,
      this.model,
      JobStatusEnum.RUNNING,
      this.nodeId,
      this.createdAt,
    );
  }

  markCompleted(): JobAggregate {
    return new JobAggregate(
      this.id,
      this.model,
      JobStatusEnum.COMPLETED,
      this.nodeId,
      this.createdAt,
    );
  }

  markFailed(): JobAggregate {
    return new JobAggregate(
      this.id,
      this.model,
      JobStatusEnum.FAILED,
      this.nodeId,
      this.createdAt,
    );
  }
}
