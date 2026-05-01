import { describe, expect, it } from "vitest";

import { FakeEntryRowStore } from "../repository-test-stores";
import { buildEntryFixture, buildEntryRowFixture } from "../test-fixtures";
import { mapEntryRow } from "./entry-row-mapping";
import { PostgresEntryRepository } from "./postgres-entry-repository";

describe("PostgresEntryRepository", () => {
  it("maps entry rows to the shared entry shape", () => {
    expect(mapEntryRow(buildEntryRowFixture())).toEqual(entryFixture);
  });

  it("maps archive and delete lifecycle timestamps", () => {
    expect(
      mapEntryRow(
        buildEntryRowFixture({
          status: "deleted",
          updatedAt: new Date("2026-04-27T01:00:00.000Z"),
          archivedAt: new Date("2026-04-26T01:00:00.000Z"),
          deletedAt: new Date("2026-04-27T01:00:00.000Z")
        })
      )
    ).toEqual({
      ...entryFixture,
      status: "deleted",
      updatedAt: "2026-04-27T01:00:00.000Z",
      archivedAt: "2026-04-26T01:00:00.000Z",
      deletedAt: "2026-04-27T01:00:00.000Z"
    });
  });

  it("maps review note rows through the base entry shape", () => {
    expect(
      mapEntryRow(
        buildEntryRowFixture({
          id: "review-1",
          kind: "review",
          epistemicStatus: "observed",
          title: "Weekly review",
          bodyMd: "No major developments since the prior review."
        })
      )
    ).toEqual(
      buildEntryFixture({
        id: "review-1",
        kind: "review",
        epistemicStatus: "observed",
        title: "Weekly review",
        bodyMd: "No major developments since the prior review."
      })
    );
  });

  it("persists a valid entry through the entry row store", async () => {
    const store = new FakeEntryRowStore();
    const repository = new PostgresEntryRepository(store);

    await expect(repository.create(entryFixture)).resolves.toEqual(
      entryFixture
    );
  });

  it("finds a created entry through a fresh repository instance", async () => {
    const store = new FakeEntryRowStore();
    const writer = new PostgresEntryRepository(store);
    const reader = new PostgresEntryRepository(store);

    await writer.create(entryFixture);

    await expect(reader.findById(entryFixture.id)).resolves.toEqual(
      entryFixture
    );
  });

  it("lists active topic entries in recent-first order", async () => {
    const store = new FakeEntryRowStore();
    const repository = new PostgresEntryRepository(store);
    store.seed(archivedEntryFixture);
    store.seed(deletedEntryFixture);
    store.seed(entryFixture);
    store.seed(
      buildEntryFixture({
        id: "entry-2",
        title: "Agency releases proposed rule",
        sortAt: "2026-04-26T00:00:00.000Z",
        createdAt: "2026-04-26T01:00:00.000Z",
        updatedAt: "2026-04-26T01:00:00.000Z"
      })
    );
    store.seed(
      buildEntryFixture({
        id: "other-topic-entry",
        topicId: "topic-2"
      })
    );

    await expect(repository.listByTopic("topic-1")).resolves.toEqual([
      buildEntryFixture({
        id: "entry-2",
        title: "Agency releases proposed rule",
        sortAt: "2026-04-26T00:00:00.000Z",
        createdAt: "2026-04-26T01:00:00.000Z",
        updatedAt: "2026-04-26T01:00:00.000Z"
      }),
      entryFixture
    ]);
  });

  it("can include archived and deleted topic entries for lifecycle-aware reads", async () => {
    const store = new FakeEntryRowStore();
    const repository = new PostgresEntryRepository(store);
    store.seed(entryFixture);
    store.seed(archivedEntryFixture);
    store.seed(deletedEntryFixture);

    await expect(
      repository.listByTopic("topic-1", {
        includeArchived: true,
        includeDeleted: true
      })
    ).resolves.toEqual([
      deletedEntryFixture,
      archivedEntryFixture,
      entryFixture
    ]);
  });

  it("updates editable entry fields through the entry row store", async () => {
    const store = new FakeEntryRowStore();
    const repository = new PostgresEntryRepository(store);
    store.seed(entryFixture);

    await expect(
      repository.update(
        entryFixture.id,
        {
          title: "Updated event",
          bodyMd: "Updated event description.",
          sortAt: "2026-04-26T00:00:00.000Z",
          epistemicStatus: "observed"
        },
        "2026-04-26T01:00:00.000Z"
      )
    ).resolves.toEqual({
      ...entryFixture,
      title: "Updated event",
      bodyMd: "Updated event description.",
      sortAt: "2026-04-26T00:00:00.000Z",
      epistemicStatus: "observed",
      updatedAt: "2026-04-26T01:00:00.000Z"
    });
  });

  it("returns undefined when updating a missing entry", async () => {
    const store = new FakeEntryRowStore();
    const repository = new PostgresEntryRepository(store);

    await expect(
      repository.update(
        "missing-entry",
        { title: "Updated event" },
        "2026-04-26T01:00:00.000Z"
      )
    ).resolves.toBeUndefined();
  });
});

const entryFixture = buildEntryFixture();

const archivedEntryFixture = buildEntryFixture({
  id: "entry-archived",
  title: "Archived review note",
  kind: "review",
  epistemicStatus: "observed",
  status: "archived",
  sortAt: "2026-04-26T00:00:00.000Z",
  createdAt: "2026-04-26T01:00:00.000Z",
  updatedAt: "2026-04-27T01:00:00.000Z",
  archivedAt: "2026-04-27T01:00:00.000Z"
});

const deletedEntryFixture = buildEntryFixture({
  id: "entry-deleted",
  title: "Deleted assessment",
  kind: "assessment",
  epistemicStatus: "forecast",
  status: "deleted",
  sortAt: "2026-04-27T00:00:00.000Z",
  createdAt: "2026-04-27T01:00:00.000Z",
  updatedAt: "2026-04-28T01:00:00.000Z",
  deletedAt: "2026-04-28T01:00:00.000Z"
});
