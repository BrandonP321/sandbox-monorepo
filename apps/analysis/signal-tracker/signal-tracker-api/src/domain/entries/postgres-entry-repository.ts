import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { entrySchema, type Entry } from "@repo/signal-tracker-shared";

import { getRuntimeDatabase, type SignalTrackerDb } from "../../db/client";
import { entries } from "../../db/schema";
import type {
  EntryRepository,
  ListEntriesByTopicOptions
} from "./entry-repository";

export type EntryRow = typeof entries.$inferSelect;
export type NewEntryRow = typeof entries.$inferInsert;

export type EntryRowStore = {
  insertEntry(entry: NewEntryRow): Promise<EntryRow>;
  selectEntryById(id: string): Promise<EntryRow | undefined>;
  selectEntriesByTopic(
    topicId: string,
    options?: ListEntriesByTopicOptions
  ): Promise<EntryRow[]>;
};

export class DrizzleEntryRowStore implements EntryRowStore {
  constructor(private readonly getDatabase: () => SignalTrackerDb) {}

  async insertEntry(entry: NewEntryRow): Promise<EntryRow> {
    const [row] = await this.getDatabase()
      .insert(entries)
      .values(entry)
      .returning();

    if (!row) {
      throw new Error("Entry insert did not return a row");
    }

    return row;
  }

  async selectEntryById(id: string): Promise<EntryRow | undefined> {
    const [row] = await this.getDatabase()
      .select()
      .from(entries)
      .where(eq(entries.id, id))
      .limit(1);

    return row;
  }

  async selectEntriesByTopic(
    topicId: string,
    options: ListEntriesByTopicOptions = {}
  ): Promise<EntryRow[]> {
    const statuses = getIncludedStatuses(options);

    return await this.getDatabase()
      .select()
      .from(entries)
      .where(
        and(eq(entries.topicId, topicId), inArray(entries.status, statuses))
      )
      .orderBy(desc(entries.sortAt), desc(entries.createdAt), asc(entries.id));
  }
}

export class PostgresEntryRepository implements EntryRepository {
  constructor(
    private readonly store: EntryRowStore = new DrizzleEntryRowStore(
      getRuntimeDatabase
    )
  ) {}

  async create(entry: Entry): Promise<Entry> {
    const row = await this.store.insertEntry({
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

    return mapEntryRow(row);
  }

  async findById(id: string): Promise<Entry | undefined> {
    const row = await this.store.selectEntryById(id);

    return row ? mapEntryRow(row) : undefined;
  }

  async listByTopic(
    topicId: string,
    options: ListEntriesByTopicOptions = {}
  ): Promise<Entry[]> {
    const rows = await this.store.selectEntriesByTopic(topicId, options);

    return rows.map(mapEntryRow);
  }
}

export function mapEntryRow(row: EntryRow): Entry {
  return entrySchema.parse({
    id: row.id,
    topicId: row.topicId,
    kind: row.kind,
    epistemicStatus: row.epistemicStatus,
    title: row.title,
    bodyMd: row.bodyMd,
    sortAt: toIsoTimestamp(row.sortAt),
    isApproximateDate: row.isApproximateDate,
    originType: row.originType,
    status: row.status,
    createdAt: toIsoTimestamp(row.createdAt),
    updatedAt: toIsoTimestamp(row.updatedAt),
    archivedAt: row.archivedAt ? toIsoTimestamp(row.archivedAt) : undefined,
    deletedAt: row.deletedAt ? toIsoTimestamp(row.deletedAt) : undefined
  });
}

function getIncludedStatuses(
  options: ListEntriesByTopicOptions
): Array<Entry["status"]> {
  const statuses: Array<Entry["status"]> = ["active"];

  if (options.includeArchived === true) {
    statuses.push("archived");
  }

  if (options.includeDeleted === true) {
    statuses.push("deleted");
  }

  return statuses;
}

function toIsoTimestamp(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}
