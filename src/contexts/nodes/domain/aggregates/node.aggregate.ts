export interface Hardware {
  cpu: string;
  ramGb: number;
  gpu: string;
  vramGb: number;
  runtime: string;
}

/**
 * An inference node. This is the ONE context that owns node identity
 * and hardware. Other contexts (chat, scheduler) never see this class —
 * they only see the primitives a command/query handler returns.
 */
export class Node {
  constructor(
    public readonly id: string,
    public readonly hardware: Hardware,
  ) {}
}
