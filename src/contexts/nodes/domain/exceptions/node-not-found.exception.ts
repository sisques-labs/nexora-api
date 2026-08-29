import { BaseException } from '@sisques-labs/nestjs-kit';

export class NodeNotFoundException extends BaseException {
  constructor(nodeId: string) {
    super(`node "${nodeId}" not found`);
  }
}
