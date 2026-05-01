import { describe, expect, it } from "vitest";

import { FakeEntryCitationRowStore } from "../repository-test-stores";
import {
  buildEntryCitationFixture,
  entryCitationToRow
} from "../test-fixtures";
import {
  mapEntryCitationRow,
  PostgresEntryCitationRepository
} from "./postgres-entry-citation-repository";

describe("PostgresEntryCitationRepository", () => {
  it("maps entry citation rows to the shared citation shape", () => {
    const citation = buildEntryCitationFixture({
      evidenceAnchorId: "anchor-1",
      relationType: "contextualizes",
      note: undefined
    });

    expect(mapEntryCitationRow(entryCitationToRow(citation))).toEqual(citation);
  });

  it("persists, reads, lists, and deletes entry citations through the row store", async () => {
    const store = new FakeEntryCitationRowStore();
    const repository = new PostgresEntryCitationRepository(store);
    const oldestCitation = buildEntryCitationFixture({
      id: "citation-1",
      createdAt: "2026-04-25T00:00:00.000Z"
    });
    const newestCitationA = buildEntryCitationFixture({
      id: "citation-2",
      evidenceItemId: "evidence-2",
      createdAt: "2026-04-26T00:00:00.000Z"
    });
    const newestCitationB = buildEntryCitationFixture({
      id: "citation-3",
      evidenceItemId: "evidence-3",
      createdAt: "2026-04-26T00:00:00.000Z"
    });
    const otherEntryCitation = buildEntryCitationFixture({
      id: "citation-4",
      entryId: "entry-2",
      createdAt: "2026-04-27T00:00:00.000Z"
    });

    for (const citation of [
      oldestCitation,
      newestCitationB,
      otherEntryCitation,
      newestCitationA
    ]) {
      await repository.createOrFind(citation);
    }

    await expect(repository.findById("citation-1")).resolves.toEqual(
      oldestCitation
    );
    await expect(repository.listByEntry("entry-1")).resolves.toEqual([
      newestCitationA,
      newestCitationB,
      oldestCitation
    ]);
    await expect(
      repository.deleteForEntry("entry-1", "citation-1")
    ).resolves.toEqual(oldestCitation);
    await expect(repository.findById("citation-1")).resolves.toBeUndefined();
    await expect(
      repository.deleteForEntry("entry-1", "citation-4")
    ).resolves.toBeUndefined();
  });

  it("returns existing item-level citations without replacing the note", async () => {
    const store = new FakeEntryCitationRowStore();
    const repository = new PostgresEntryCitationRepository(store);
    const originalCitation = buildEntryCitationFixture({
      id: "citation-1",
      note: "Original note."
    });
    const duplicateCitation = buildEntryCitationFixture({
      id: "citation-2",
      note: "Replacement note."
    });

    await expect(repository.createOrFind(originalCitation)).resolves.toEqual(
      originalCitation
    );
    await expect(repository.createOrFind(duplicateCitation)).resolves.toEqual(
      originalCitation
    );
    expect(store.count()).toBe(1);
  });

  it("deduplicates anchor-level citations separately from item-level citations", async () => {
    const store = new FakeEntryCitationRowStore();
    const repository = new PostgresEntryCitationRepository(store);
    const itemCitation = buildEntryCitationFixture({
      id: "citation-1",
      evidenceAnchorId: undefined
    });
    const anchorCitation = buildEntryCitationFixture({
      id: "citation-2",
      evidenceAnchorId: "anchor-1"
    });
    const duplicateAnchorCitation = buildEntryCitationFixture({
      id: "citation-3",
      evidenceAnchorId: "anchor-1"
    });

    await repository.createOrFind(itemCitation);
    await repository.createOrFind(anchorCitation);
    await expect(
      repository.createOrFind(duplicateAnchorCitation)
    ).resolves.toEqual(anchorCitation);
    expect(store.count()).toBe(2);
  });
});
