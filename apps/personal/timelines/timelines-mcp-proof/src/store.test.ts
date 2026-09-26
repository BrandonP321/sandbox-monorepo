import { describe, expect, it } from "vitest";
import { type Change, type Content, fixtureEntries } from "./contracts.js";
import { FixtureStore } from "./store.js";

const content = {
  title: "Paper launch",
  date: "2041",
  description: "Synthetic",
  source: "Fixture B"
} satisfies Content;
const add = { action: "add", id: "fixture-added", content } satisfies Change;
const edit = {
  action: "edit",
  id: "fixture-alpha",
  expectedVersion: 1,
  content
} satisfies Change;

describe("disposable mutation contract", () => {
  it("replays an exact addition once and rejects a reused key with different content", () => {
    const store = new FixtureStore();
    const input = { requestId: "add-1", expectedVersion: 1, change: add };
    const batch = store.direct(input);
    expect(store.direct(input)).toEqual(batch);
    expect(store.read().entries).toHaveLength(3);
    expect(store.history()).toHaveLength(1);
    expect(() =>
      store.direct({
        ...input,
        change: { ...add, content: { ...content, title: "Different" } }
      })
    ).toThrow("RETRY_MISMATCH");
    expect(() =>
      store.direct({ ...input, requestId: "new-key", expectedVersion: 2 })
    ).toThrow("ENTRY_EXISTS");
  });

  it("previews exact before/after, requires approval, applies atomically and undoes with history", () => {
    const store = new FixtureStore();
    const before = store.read();
    const proposal = store.propose({
      requestId: "preview",
      expectedVersion: 1,
      changes: [edit, add]
    });
    expect(store.read()).toEqual(before);
    expect(proposal.differences[0]).toEqual({
      id: edit.id,
      before: fixtureEntries[0],
      after: { ...content, id: edit.id, version: 2, deleted: false }
    });
    const input = {
      requestId: "apply",
      proposalId: proposal.id,
      digest: proposal.digest
    };
    expect(() => store.apply(input)).toThrow("OWNER_APPROVAL_REQUIRED");
    expect(() => store.approve(proposal.id, "0".repeat(64))).toThrow(
      "DIGEST_MISMATCH"
    );
    store.approve(proposal.id, proposal.digest);
    const batch = store.apply(input);
    expect(store.apply(input)).toEqual(batch);
    expect(store.read().entries.map(({ title }) => title)).toContain(
      content.title
    );
    const undo = { requestId: "undo", expectedVersion: 2, batchId: batch.id };
    const reversed = store.undo(undo);
    expect(store.undo(undo)).toEqual(reversed);
    expect(store.read().entries).toEqual(
      before.entries.map((entry) => ({
        ...entry,
        version: entry.id === edit.id ? 3 : entry.version
      }))
    );
    expect(store.history()).toHaveLength(2);
    expect(reversed.differences[1].after.deleted).toBe(true);
    expect(store.read().entries[0].version).toBe(3);
    expect(() =>
      store.undo({ ...undo, requestId: "undo-again", expectedVersion: 3 })
    ).toThrow("ALREADY_UNDONE");
  });

  it("rejects stale approved previews without overwriting a later edit", () => {
    const store = new FixtureStore();
    const proposal = store.propose({
      requestId: "preview",
      expectedVersion: 1,
      changes: [edit, add]
    });
    store.approve(proposal.id, proposal.digest);
    store.direct({
      requestId: "concurrent",
      expectedVersion: 1,
      change: { ...edit, content: { ...content, title: "Later edit" } }
    });
    const later = store.read();
    expect(() =>
      store.apply({
        requestId: "apply",
        proposalId: proposal.id,
        digest: proposal.digest
      })
    ).toThrow("STALE_VERSION");
    expect(() => store.approve(proposal.id, proposal.digest)).toThrow(
      "STALE_VERSION"
    );
    expect(store.read()).toEqual(later);
    expect(store.history()).toHaveLength(1);
  });

  it("rejects an invalid second operation without applying the first", () => {
    const store = new FixtureStore();
    const before = store.read();
    expect(() =>
      store.propose({
        requestId: "preview",
        expectedVersion: 1,
        changes: [add, { ...edit, id: "missing" }]
      })
    ).toThrow("ENTRY_NOT_FOUND");
    expect(() =>
      store.propose({
        requestId: "duplicate",
        expectedVersion: 1,
        changes: [add, add]
      })
    ).toThrow("DUPLICATE_TARGET");
    expect(store.read()).toEqual(before);
    expect(store.history()).toEqual([]);
  });

  it("does not undo over later content even with a freshly read timeline version", () => {
    const store = new FixtureStore();
    const batch = store.direct({
      requestId: "first",
      expectedVersion: 1,
      change: edit
    });
    store.direct({
      requestId: "later",
      expectedVersion: 2,
      change: {
        ...edit,
        expectedVersion: 2,
        content: { ...content, title: "Later" }
      }
    });
    const before = store.read();
    expect(() =>
      store.undo({ requestId: "undo", batchId: batch.id, expectedVersion: 3 })
    ).toThrow("UNDO_CONFLICT");
    expect(store.read()).toEqual(before);
  });

  it("keeps stored proposals immutable and treats injected source instructions as plain text", () => {
    const store = new FixtureStore();
    const before = store.read();
    expect(before.entries[1].source).toContain("permanently delete");
    const proposal = store.propose({
      requestId: "preview",
      expectedVersion: 1,
      changes: [edit]
    });
    proposal.differences[0].after.title = "Changed outside server";
    store.approve(proposal.id, proposal.digest);
    store.apply({
      requestId: "apply",
      proposalId: proposal.id,
      digest: proposal.digest
    });
    expect(store.read().entries[0].title).toBe(content.title);
    expect(store.read().entries[1]).toEqual(before.entries[1]);
  });
});
