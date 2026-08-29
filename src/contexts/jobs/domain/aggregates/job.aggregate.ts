/**
 * Models the lifecycle of an inference job:
 * PENDING → SCHEDULED → RUNNING → COMPLETED (or FAILED at any point).
 */
export enum JobStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * The job aggregate: this is the ONE context that owns a job's identity
 * and lifecycle. Other contexts (chat) never see this class — a command
 * handler maps it to a JobSnapshot (see application/dtos) before
 * returning, and only that snapshot crosses the context boundary, via a
 * port + adapter. Immutable by design: a transition (markScheduled,
 * markRunning, ...) returns a new Job rather than mutating this one.
 */
export class Job {
  constructor(
    public readonly id: string,
    public readonly model: string,
    public readonly status: JobStatus,
    public readonly nodeId: string | null,
    public readonly createdAt: Date,
  ) {}

  static createdFor(id: string, model: string, createdAt: Date): Job {
    return new Job(id, model, JobStatus.PENDING, null, createdAt);
  }

  markScheduled(nodeId: string): Job {
    return new Job(
      this.id,
      this.model,
      JobStatus.SCHEDULED,
      nodeId,
      this.createdAt,
    );
  }

  markRunning(): Job {
    return new Job(
      this.id,
      this.model,
      JobStatus.RUNNING,
      this.nodeId,
      this.createdAt,
    );
  }

  markCompleted(): Job {
    return new Job(
      this.id,
      this.model,
      JobStatus.COMPLETED,
      this.nodeId,
      this.createdAt,
    );
  }

  markFailed(): Job {
    return new Job(
      this.id,
      this.model,
      JobStatus.FAILED,
      this.nodeId,
      this.createdAt,
    );
  }
}
