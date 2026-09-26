// In-memory specification of conditional publication, not a DynamoDB emulator.
import { createHash } from "node:crypto";
import { closure, type Graph } from "./access.mts";

export type Entity = {
  id: string;
  version: number;
  value: string;
  deleted?: boolean;
};
export type Operation = {
  id: string;
  expected: number;
  value: string;
  deleted?: boolean;
};
export type Plan = {
  id: string;
  epoch: number;
  operations: Operation[];
  graph?: [string, string[]][];
};
export type Batch = {
  id: string;
  digest: string;
  before: (Entity | undefined)[];
  after: Entity[];
};
export const MAX_OPERATIONS = 20;

export function digest(plan: Plan) {
  // Production canonicalizes validated object fields before SHA-256.
  return createHash("sha256").update(JSON.stringify(plan)).digest("hex");
}

export class Store {
  epoch = 0;
  entities = new Map<string, Entity>();
  graph: Graph = new Map();
  revisions = new Map<string, Entity[]>();
  batches = new Map<string, Batch>();

  apply(
    plan: Plan,
    approvedDigest = digest(plan),
    failBeforeCommit = false
  ): Batch {
    const hash = digest(plan);
    if (hash !== approvedDigest) throw new Error("PREVIEW_CHANGED");
    const existing = this.batches.get(plan.id);
    if (existing) {
      if (existing.digest !== hash) throw new Error("IDEMPOTENCY_CONFLICT");
      return existing;
    }
    if (!plan.operations.length || plan.operations.length > MAX_OPERATIONS)
      throw new Error("BATCH_SIZE");
    if (
      new Set(plan.operations.map((op) => op.id)).size !==
      plan.operations.length
    )
      throw new Error("DUPLICATE_ENTITY");
    if (this.epoch !== plan.epoch) throw new Error("VERSION_CONFLICT");
    for (const op of plan.operations) {
      if ((this.entities.get(op.id)?.version ?? 0) !== op.expected)
        throw new Error("VERSION_CONFLICT");
    }
    const graph = new Map(plan.graph ?? this.graph);
    for (const root of graph.keys()) closure(graph, root);
    const before = plan.operations.map((op) => this.entities.get(op.id));
    const after = plan.operations.map((op) => ({
      id: op.id,
      version: op.expected + 1,
      value: op.value,
      deleted: op.deleted
    }));
    // Corresponds to one successful TransactWriteItems; no visible staging.
    if (failBeforeCommit) throw new Error("TRANSACTION_CANCELED");
    for (const entity of after) {
      this.entities.set(entity.id, entity);
      this.revisions.set(entity.id, [
        ...(this.revisions.get(entity.id) ?? []),
        entity
      ]);
    }
    this.graph = graph;
    this.epoch++;
    const batch = { id: plan.id, digest: hash, before, after };
    this.batches.set(plan.id, batch);
    return batch;
  }

  undoPlan(batchId: string, undoId: string): Plan {
    const batch = this.batches.get(batchId);
    if (!batch) throw new Error("NOT_FOUND");
    return {
      id: undoId,
      epoch: this.epoch,
      operations: batch.after.map((after, index) => ({
        id: after.id,
        expected: after.version,
        value: batch.before[index]?.value ?? after.value,
        deleted: batch.before[index]?.deleted ?? !batch.before[index]
      }))
    };
  }
}

export function transactionFits(actions: number, bytes: number) {
  return actions > 0 && actions <= 90 && bytes <= 2 * 1024 * 1024;
}

export function chunks(operations: Operation[]) {
  const result: Operation[][] = [];
  for (let offset = 0; offset < operations.length; offset += MAX_OPERATIONS) {
    result.push(operations.slice(offset, offset + MAX_OPERATIONS));
  }
  return result;
}
