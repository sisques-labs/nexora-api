export interface Hardware {
  cpu: string;
  ramGb: number;
  gpu: string;
  vramGb: number;
  runtime: string;
}

/**
 * An available inference node. In v0 the real registry lives in
 * nexora-nodes; here it's just the shape nexora-api needs to reason
 * about which node it routes to.
 */
export class NodeAggregate {
  constructor(
    public readonly id: string,
    public readonly hardware: Hardware,
  ) {}
}
