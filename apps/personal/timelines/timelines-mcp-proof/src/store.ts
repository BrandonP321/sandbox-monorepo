import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import {
  applyInput,
  directInput,
  fixtureEntries,
  proposalInput,
  ProofError,
  TIMELINE_ID,
  undoInput,
  type Batch,
  type Change,
  type Difference,
  type Proposal
} from "./contracts.js";

export class FixtureStore {
  private entries = new Map(
    fixtureEntries.map((entry) => [entry.id, structuredClone(entry)])
  );
  private version = 1;
  private proposals = new Map<string, Proposal>();
  private approvals = new Set<string>();
  private batches = new Map<string, Batch>();
  private undone = new Set<string>();
  private retries = new Map<string, { fingerprint: string; result: unknown }>();

  read() {
    return structuredClone({
      id: TIMELINE_ID,
      title: "Disposable paper observatory",
      version: this.version,
      entries: [...this.entries.values()].filter((entry) => !entry.deleted)
    });
  }

  history() {
    return structuredClone([...this.batches.values()]);
  }

  getProposal(id: string) {
    const proposal = this.proposals.get(id);
    if (!proposal) throw new ProofError("PROPOSAL_NOT_FOUND");
    return structuredClone(proposal);
  }

  // Only the separate owner endpoint calls this; there is no MCP approval tool.
  approve(id: string, digest: string) {
    const proposal = this.getProposal(id);
    if (proposal.digest !== digest) throw new ProofError("DIGEST_MISMATCH");
    this.checkVersion(proposal.baseVersion);
    this.approvals.add(id);
    return { approved: id, digest };
  }

  direct(input: z.infer<typeof directInput>) {
    return this.retry(
      input.requestId,
      { tool: "change_entry", ...input },
      () => {
        this.checkVersion(input.expectedVersion);
        return this.commit(this.preview([input.change]));
      }
    );
  }

  propose(input: z.infer<typeof proposalInput>) {
    return this.retry(
      input.requestId,
      { tool: "propose_batch", ...input },
      () => {
        this.checkVersion(input.expectedVersion);
        const snapshot = {
          id: randomUUID(),
          baseVersion: this.version,
          differences: this.preview(input.changes)
        };
        const proposal = {
          ...snapshot,
          digest: createHash("sha256")
            .update(JSON.stringify(snapshot))
            .digest("hex")
        };
        this.proposals.set(proposal.id, proposal);
        return proposal;
      }
    );
  }

  apply(input: z.infer<typeof applyInput>) {
    return this.retry(
      input.requestId,
      { tool: "apply_proposal", ...input },
      () => {
        const proposal = this.getProposal(input.proposalId);
        if (proposal.digest !== input.digest)
          throw new ProofError("DIGEST_MISMATCH");
        if (!this.approvals.has(proposal.id))
          throw new ProofError("OWNER_APPROVAL_REQUIRED");
        this.checkVersion(proposal.baseVersion);
        const batch = this.commit(proposal.differences);
        this.approvals.delete(proposal.id);
        return batch;
      }
    );
  }

  undo(input: z.infer<typeof undoInput>) {
    return this.retry(input.requestId, { tool: "undo_batch", ...input }, () => {
      this.checkVersion(input.expectedVersion);
      const batch = this.batches.get(input.batchId);
      if (!batch) throw new ProofError("BATCH_NOT_FOUND");
      if (this.undone.has(batch.id) || batch.undoOf)
        throw new ProofError("ALREADY_UNDONE");
      const differences = batch.differences.map(({ id, before, after }) => {
        const current = this.entries.get(id);
        if (!current || current.version !== after.version)
          throw new ProofError("UNDO_CONFLICT");
        return {
          id,
          before: current,
          after: {
            ...(before ?? current),
            deleted: before?.deleted ?? true,
            version: current.version + 1
          }
        };
      });
      const result = this.commit(differences, batch.id);
      this.undone.add(batch.id);
      return result;
    });
  }

  private checkVersion(expected: number) {
    if (this.version !== expected) throw new ProofError("STALE_VERSION");
  }

  private preview(changes: Change[]): Difference[] {
    if (new Set(changes.map(({ id }) => id)).size !== changes.length) {
      throw new ProofError("DUPLICATE_TARGET");
    }
    return changes.map((change) => {
      const before = this.entries.get(change.id);
      if (change.action === "add" && before)
        throw new ProofError("ENTRY_EXISTS");
      if (change.action === "edit") {
        if (!before || before.deleted) throw new ProofError("ENTRY_NOT_FOUND");
        if (before.version !== change.expectedVersion)
          throw new ProofError("STALE_ENTRY");
      }
      return {
        id: change.id,
        before: before ?? null,
        after: {
          ...change.content,
          id: change.id,
          version: (before?.version ?? 0) + 1,
          deleted: false
        }
      };
    });
  }

  private commit(differences: Difference[], undoOf?: string): Batch {
    // Synchronous validation + publication: no await/partial writes in this in-memory proof.
    const batch = {
      id: randomUUID(),
      version: this.version + 1,
      differences,
      ...(undoOf ? { undoOf } : {})
    };
    for (const { id, after } of differences)
      this.entries.set(id, structuredClone(after));
    this.version = batch.version;
    this.batches.set(batch.id, structuredClone(batch));
    return batch;
  }

  private retry<T>(requestId: string, input: unknown, perform: () => T): T {
    const fingerprint = JSON.stringify(input);
    const previous = this.retries.get(requestId);
    if (previous) {
      if (previous.fingerprint !== fingerprint)
        throw new ProofError("RETRY_MISMATCH");
      return structuredClone(previous.result) as T;
    }
    const result = perform();
    this.retries.set(requestId, {
      fingerprint,
      result: structuredClone(result)
    });
    return structuredClone(result);
  }
}
