import { and, asc, desc, eq, inArray } from "drizzle-orm";

import type { Entry } from "@repo/signal-tracker-shared";

import { getRuntimeDatabase, type SignalTrackerDb } from "../../db/client";
import { entries } from "../../db/schema";
import { toDate } from "../persistence/timestamps";
import { mapEntryRow, mapEntryToNewEntryRow } from "./entry-row-mapping";
import type {
  EntryRepository,
  ListEntriesByTopicOptions
} from "./entry-repository";

export { mapEntryRow } from "./entry-row-mapping";

export type EntryRow = typeof entries.$inferSelect;
export type NewEntryRow = typeof entries.$inferInsert;
type EntryRowUpdate = Partial<
  Pick<
    NewEntryRow,
    "title" | "bodyMd" | "sortAt" | "epistemicStatus" | "updatedAt"
  >
>;

export type EntryRowStore = {
  insertEntry(entry: NewEntryRow): Promise<EntryRow>;
  selectEntryById(id: string): Promise<EntryRow | undefined>;
  selectEntriesByTopic(
    topicId: string,
    options?: ListEntriesByTopicOptions
  ): Promise<EntryRow[]>;
  updateEntry(
    id: string,
    updates: EntryRowUpdate
  ): Promise<EntryRow | undefined>;
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

  async updateEntry(
    id: string,
    updates: EntryRowUpdate
  ): Promise<EntryRow | undefined> {
    const [row] = await this.getDatabase()
      .update(entries)
      .set(updates)
      .where(eq(entries.id, id))
      .returning();

    return row;
  }
}

export class PostgresEntryRepository implements EntryRepository {
  constructor(
    private readonly store: EntryRowStore = new DrizzleEntryRowStore(
      getRuntimeDatabase
    )
  ) {}

  async create(entry: Entry): Promise<Entry> {
    const row = await this.store.insertEntry(mapEntryToNewEntryRow(entry));

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

  async update(
    id: string,
    updates: Parameters<EntryRepository["update"]>[1],
    updatedAt: string
  ): Promise<Entry | undefined> {
    const row = await this.store.updateEntry(id, {
      ...mapEntryUpdatesToRow(updates),
      updatedAt: toDate(updatedAt)
    });

    return row ? mapEntryRow(row) : undefined;
  }
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

function mapEntryUpdatesToRow(
  updates: Parameters<EntryRepository["update"]>[1]
): EntryRowUpdate {
  const rowUpdates: EntryRowUpdate = {};

  if (updates.title !== undefined) {
    rowUpdates.title = updates.title;
  }

  if (updates.bodyMd !== undefined) {
    rowUpdates.bodyMd = updates.bodyMd;
  }

  if (updates.sortAt !== undefined) {
    rowUpdates.sortAt = toDate(updates.sortAt);
  }

  if (updates.epistemicStatus !== undefined) {
    rowUpdates.epistemicStatus = updates.epistemicStatus;
  }

  return rowUpdates;
}
