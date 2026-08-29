/**
 * Models the lifecycle of an inference job:
 * PENDING → SCHEDULED → RUNNING → COMPLETED (or FAILED at any point).
 */
export enum JobStatusEnum {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
