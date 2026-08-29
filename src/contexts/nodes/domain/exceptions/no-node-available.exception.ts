import { BaseException } from '@sisques-labs/nestjs-kit';

export class NoNodeAvailableException extends BaseException {
  constructor() {
    super('no node registered');
  }
}
