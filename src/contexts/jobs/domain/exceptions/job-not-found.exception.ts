import { BaseException } from '@sisques-labs/nestjs-kit';

export class JobNotFoundException extends BaseException {
  constructor(jobId: string) {
    super(`job "${jobId}" not found`);
  }
}
