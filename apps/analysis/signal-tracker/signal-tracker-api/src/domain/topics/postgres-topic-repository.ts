import { and, asc, desc, eq, ilike, or } from "drizzle-orm";

import { topicSchema, type Topic } from "@repo/signal-tracker-shared";

import { getRuntimeDatabase, type SignalTrackerDb } from "../../db/client";
import { topics } from "../../db/schema";
import {
  nullableDateToIso,
  toDate,
  toIsoTimestamp
} from "../persistence/timestamps";
import type {
  ListTopicsOptions,
  TopicRepository,
  UpdateTopicFields
} from "./topic-repository";

export type TopicRow = typeof topics.$inferSelect;
export type NewTopicRow = typeof topics.$inferInsert;
type TopicRowUpdate = Partial<
  Pick<
    NewTopicRow,
    | "title"
    | "framingQuestion"
    | "scopeNote"
    | "reviewCadence"
    | "status"
    | "updatedAt"
    | "archivedAt"
  >
>;

export type TopicRowStore = {
  insertTopic(topic: NewTopicRow): Promise<TopicRow>;
  selectTopicById(id: string): Promise<TopicRow | undefined>;
  selectTopics(options?: ListTopicsOptions): Promise<TopicRow[]>;
  updateTopic(
    id: string,
    updates: TopicRowUpdate
  ): Promise<TopicRow | undefined>;
  deleteTopic(id: string): Promise<TopicRow | undefined>;
};

export class DrizzleTopicRowStore implements TopicRowStore {
  constructor(private readonly getDatabase: () => SignalTrackerDb) {}

  async insertTopic(topic: NewTopicRow): Promise<TopicRow> {
    const [row] = await this.getDatabase()
      .insert(topics)
      .values(topic)
      .returning();

    if (!row) {
      throw new Error("Topic insert did not return a row");
    }

    return row;
  }

  async selectTopicById(id: string): Promise<TopicRow | undefined> {
    const [row] = await this.getDatabase()
      .select()
      .from(topics)
      .where(eq(topics.id, id))
      .limit(1);

    return row;
  }

  async selectTopics(options: ListTopicsOptions = {}): Promise<TopicRow[]> {
    const queryPattern = options.query
      ? `%${escapeIlikePattern(options.query)}%`
      : undefined;
    const queryFilter = queryPattern
      ? or(
          ilike(topics.title, queryPattern),
          ilike(topics.framingQuestion, queryPattern),
          ilike(topics.scopeNote, queryPattern)
        )
      : undefined;

    return await this.getDatabase()
      .select()
      .from(topics)
      .where(and(eq(topics.status, "active"), queryFilter))
      .orderBy(desc(topics.updatedAt), desc(topics.createdAt), asc(topics.id));
  }

  async updateTopic(
    id: string,
    updates: TopicRowUpdate
  ): Promise<TopicRow | undefined> {
    const [row] = await this.getDatabase()
      .update(topics)
      .set(updates)
      .where(eq(topics.id, id))
      .returning();

    return row;
  }

  async deleteTopic(id: string): Promise<TopicRow | undefined> {
    const [row] = await this.getDatabase()
      .delete(topics)
      .where(eq(topics.id, id))
      .returning();

    return row;
  }
}

export class PostgresTopicRepository implements TopicRepository {
  constructor(
    private readonly store: TopicRowStore = new DrizzleTopicRowStore(
      getRuntimeDatabase
    )
  ) {}

  async create(topic: Topic): Promise<Topic> {
    const row = await this.store.insertTopic({
      id: topic.id,
      title: topic.title,
      framingQuestion: topic.framingQuestion,
      scopeNote: topic.scopeNote,
      reviewCadence: topic.reviewCadence,
      status: topic.status,
      createdAt: toDate(topic.createdAt),
      updatedAt: toDate(topic.updatedAt)
    });

    return mapTopicRow(row);
  }

  async findById(id: string): Promise<Topic | undefined> {
    const row = await this.store.selectTopicById(id);

    return row ? mapTopicRow(row) : undefined;
  }

  async list(options: ListTopicsOptions = {}): Promise<Topic[]> {
    const rows = await this.store.selectTopics(options);

    return rows.map(mapTopicRow);
  }

  async update(
    id: string,
    updates: UpdateTopicFields,
    updatedAt: string
  ): Promise<Topic | undefined> {
    const row = await this.store.updateTopic(id, {
      ...mapTopicUpdatesToRow(updates),
      updatedAt: toDate(updatedAt)
    });

    return row ? mapTopicRow(row) : undefined;
  }

  async archive(id: string, archivedAt: string): Promise<Topic | undefined> {
    const archivedAtDate = toDate(archivedAt);
    const row = await this.store.updateTopic(id, {
      status: "archived",
      archivedAt: archivedAtDate,
      updatedAt: archivedAtDate
    });

    return row ? mapTopicRow(row) : undefined;
  }

  async delete(id: string): Promise<Topic | undefined> {
    const row = await this.store.deleteTopic(id);

    return row ? mapTopicRow(row) : undefined;
  }
}

export function mapTopicRow(row: TopicRow): Topic {
  return topicSchema.parse({
    id: row.id,
    title: row.title,
    framingQuestion: row.framingQuestion,
    status: row.status,
    createdAt: toIsoTimestamp(row.createdAt),
    updatedAt: toIsoTimestamp(row.updatedAt),
    scopeNote: row.scopeNote ?? undefined,
    reviewCadence: row.reviewCadence,
    archivedAt: nullableDateToIso(row.archivedAt)
  });
}

function mapTopicUpdatesToRow(updates: UpdateTopicFields): TopicRowUpdate {
  const rowUpdates: TopicRowUpdate = {};

  if (updates.title !== undefined) {
    rowUpdates.title = updates.title;
  }

  if (updates.framingQuestion !== undefined) {
    rowUpdates.framingQuestion = updates.framingQuestion;
  }

  if (updates.scopeNote !== undefined) {
    rowUpdates.scopeNote = updates.scopeNote ?? null;
  }

  if (updates.reviewCadence !== undefined) {
    rowUpdates.reviewCadence = updates.reviewCadence;
  }

  return rowUpdates;
}

export function escapeIlikePattern(query: string): string {
  return query
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}
