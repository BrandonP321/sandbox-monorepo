import { eq } from "drizzle-orm";

import { topicSchema, type Topic } from "@repo/signal-tracker-shared";

import { getRuntimeDatabase, type SignalTrackerDb } from "../../db/client";
import { topics } from "../../db/schema";
import type { TopicRepository } from "./topic-repository";

export type TopicRow = typeof topics.$inferSelect;
export type NewTopicRow = typeof topics.$inferInsert;

export type TopicRowStore = {
  insertTopic(topic: NewTopicRow): Promise<TopicRow>;
  selectTopicById(id: string): Promise<TopicRow | undefined>;
};

export class DrizzleTopicRowStore implements TopicRowStore {
  constructor(private readonly getDatabase: () => SignalTrackerDb) {}

  async insertTopic(topic: NewTopicRow): Promise<TopicRow> {
    const [row] = await this.getDatabase().insert(topics).values(topic).returning();

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
      createdAt: new Date(topic.createdAt),
      updatedAt: new Date(topic.updatedAt)
    });

    return mapTopicRow(row);
  }

  async findById(id: string): Promise<Topic | undefined> {
    const row = await this.store.selectTopicById(id);

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
    reviewCadence: row.reviewCadence
  });
}

function toIsoTimestamp(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}
