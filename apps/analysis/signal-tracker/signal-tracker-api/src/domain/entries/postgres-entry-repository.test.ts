import { describe, expect, it } from "vitest";

import type { Entry } from "@repo/signal-tracker-shared";

import type { ListEntriesByTopicOptions } from "./entry-repository";
import {
  mapEntryRow,
  PostgresEntryRepository,
  type EntryRow,
  type EntryRowStore,
  type NewEntryRow
} from "./postgres-entry-repository";

describe("PostgresEntryRepository", () => {
  it("maps entry rows to the shared entry shape", () => {
    expect(
      mapEntryRow({
        id: "entry-1",
        topicId: "topic-1",
        kind: "event",
        epistemicStatus: "reported",
        title: "Court grants injunction",
        bodyMd: "A federal court granted an injunction.",
        sortAt: new Date("2026-04-25T00:00:00.000Z"),
        isApproximateDate: false,
        originType: "manual",
        status: "active",
        createdAt: new Date("2026-04-25T01:00:00.000Z"),
        updatedAt: new Date("2026-04-25T01:00:00.000Z"),
        archivedAt: null,
        deletedAt: null
      })
    ).toEqual(entryFixture);
  });

  it("maps archive and delete lifecycle timestamps", () => {
    expect(
      mapEntryRow({
        ...entryRowFixture,
        status: "deleted",
        updatedAt: new Date("2026-04-27T01:00:00.000Z"),
        archivedAt: new Date("2026-04-26T01:00:00.000Z"),
        deletedAt: new Date("2026-04-27T01:00:00.000Z")
      })
    ).toEqual({
      ...entryFixture,
      status: "deleted",
      updatedAt: "2026-04-27T01:00:00.000Z",
      archivedAt: "2026-04-26T01:00:00.000Z",
      deletedAt: "2026-04-27T01:00:00.000Z"
    });
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
    store.seed({
      ...entryFixture,
      id: "entry-2",
      title: "Agency releases proposed rule",
      sortAt: "2026-04-26T00:00:00.000Z",
      createdAt: "2026-04-26T01:00:00.000Z",
      updatedAt: "2026-04-26T01:00:00.000Z"
    });
    store.seed({
      ...entryFixture,
      id: "other-topic-entry",
      topicId: "topic-2"
    });

    await expect(repository.listByTopic("topic-1")).resolves.toEqual([
      {
        ...entryFixture,
        id: "entry-2",
        title: "Agency releases proposed rule",
        sortAt: "2026-04-26T00:00:00.000Z",
        createdAt: "2026-04-26T01:00:00.000Z",
        updatedAt: "2026-04-26T01:00:00.000Z"
      },
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
});

const entryFixture: Entry = {
  id: "entry-1",
  topicId: "topic-1",
  kind: "event",
  epistemicStatus: "reported",
  title: "Court grants injunction",
  bodyMd: "A federal court granted an injunction.",
  sortAt: "2026-04-25T00:00:00.000Z",
  isApproximateDate: false,
  originType: "manual",
  status: "active",
  createdAt: "2026-04-25T01:00:00.000Z",
  updatedAt: "2026-04-25T01:00:00.000Z"
};

const archivedEntryFixture: Entry = {
  ...entryFixture,
  id: "entry-archived",
  title: "Archived review note",
  kind: "review",
  epistemicStatus: "observed",
  status: "archived",
  sortAt: "2026-04-26T00:00:00.000Z",
  createdAt: "2026-04-26T01:00:00.000Z",
  updatedAt: "2026-04-27T01:00:00.000Z",
  archivedAt: "2026-04-27T01:00:00.000Z"
};

const deletedEntryFixture: Entry = {
  ...entryFixture,
  id: "entry-deleted",
  title: "Deleted assessment",
  kind: "assessment",
  epistemicStatus: "forecast",
  status: "deleted",
  sortAt: "2026-04-27T00:00:00.000Z",
  createdAt: "2026-04-27T01:00:00.000Z",
  updatedAt: "2026-04-28T01:00:00.000Z",
  deletedAt: "2026-04-28T01:00:00.000Z"
};

const entryRowFixture: EntryRow = {
  id: "entry-1",
  topicId: "topic-1",
  kind: "event",
  epistemicStatus: "reported",
  title: "Court grants injunction",
  bodyMd: "A federal court granted an injunction.",
  sortAt: new Date("2026-04-25T00:00:00.000Z"),
  isApproximateDate: false,
  originType: "manual",
  status: "active",
  createdAt: new Date("2026-04-25T01:00:00.000Z"),
  updatedAt: new Date("2026-04-25T01:00:00.000Z"),
  archivedAt: null,
  deletedAt: null
};

class FakeEntryRowStore implements EntryRowStore {
  private readonly entries = new Map<string, EntryRow>();

  async insertEntry(entry: NewEntryRow): Promise<EntryRow> {
    const row: EntryRow = {
      id: entry.id,
      topicId: entry.topicId,
      kind: entry.kind,
      epistemicStatus: entry.epistemicStatus,
      title: entry.title,
      bodyMd: entry.bodyMd,
      sortAt: entry.sortAt,
      isApproximateDate: entry.isApproximateDate ?? false,
      originType: entry.originType ?? "manual",
      status: entry.status ?? "active",
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      archivedAt: entry.archivedAt ? new Date(entry.archivedAt) : null,
      deletedAt: entry.deletedAt ? new Date(entry.deletedAt) : null
    };

    this.entries.set(row.id, row);

    return row;
  }

  async selectEntryById(id: string): Promise<EntryRow | undefined> {
    return this.entries.get(id);
  }

  async selectEntriesByTopic(
    topicId: string,
    options: ListEntriesByTopicOptions = {}
  ): Promise<EntryRow[]> {
    return Array.from(this.entries.values())
      .filter((row) => row.topicId === topicId)
      .filter((row) => {
        if (row.status === "archived") {
          return options.includeArchived === true;
        }

        if (row.status === "deleted") {
          return options.includeDeleted === true;
        }

        return row.status === "active";
      })
      .sort(compareEntryRowsForList);
  }

  seed(entry: Entry): void {
    this.entries.set(entry.id, {
      id: entry.id,
      topicId: entry.topicId,
      kind: entry.kind,
      epistemicStatus: entry.epistemicStatus,
      title: entry.title,
      bodyMd: entry.bodyMd,
      sortAt: new Date(entry.sortAt),
      isApproximateDate: entry.isApproximateDate,
      originType: entry.originType,
      status: entry.status,
      createdAt: new Date(entry.createdAt),
      updatedAt: new Date(entry.updatedAt),
      archivedAt: entry.archivedAt ? new Date(entry.archivedAt) : null,
      deletedAt: entry.deletedAt ? new Date(entry.deletedAt) : null
    });
  }
}

function compareEntryRowsForList(left: EntryRow, right: EntryRow): number {
  const sortAtComparison = getTime(right.sortAt) - getTime(left.sortAt);

  if (sortAtComparison !== 0) {
    return sortAtComparison;
  }

  const createdAtComparison =
    getTime(right.createdAt) - getTime(left.createdAt);

  if (createdAtComparison !== 0) {
    return createdAtComparison;
  }

  return left.id.localeCompare(right.id);
}

function getTime(value: Date | string): number {
  return new Date(value).getTime();
}
