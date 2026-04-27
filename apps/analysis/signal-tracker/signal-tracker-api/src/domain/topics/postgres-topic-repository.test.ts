import { describe, expect, it } from "vitest";

import type { Topic } from "@repo/signal-tracker-shared";

import {
  mapTopicRow,
  PostgresTopicRepository,
  type NewTopicRow,
  type TopicRow,
  type TopicRowStore
} from "./postgres-topic-repository";

describe("PostgresTopicRepository", () => {
  it("maps topic rows to the shared API topic shape", () => {
    expect(
      mapTopicRow({
        id: "topic-1",
        title: "Iran strike risk",
        framingQuestion: "Will tensions escalate?",
        scopeNote: null,
        reviewCadence: "weekly",
        status: "active",
        createdAt: new Date("2026-04-25T00:00:00.000Z"),
        updatedAt: new Date("2026-04-25T00:00:00.000Z")
      })
    ).toEqual({
      id: "topic-1",
      title: "Iran strike risk",
      framingQuestion: "Will tensions escalate?",
      reviewCadence: "weekly",
      status: "active",
      createdAt: "2026-04-25T00:00:00.000Z",
      updatedAt: "2026-04-25T00:00:00.000Z"
    });
  });

  it("persists a valid topic through the topic row store", async () => {
    const store = new FakeTopicRowStore();
    const repository = new PostgresTopicRepository(store);

    await expect(repository.create(topicFixture)).resolves.toEqual(
      topicFixture
    );
  });

  it("finds a created topic through a fresh repository instance", async () => {
    const store = new FakeTopicRowStore();
    const writer = new PostgresTopicRepository(store);
    const reader = new PostgresTopicRepository(store);

    await writer.create(topicFixture);

    await expect(reader.findById(topicFixture.id)).resolves.toEqual(
      topicFixture
    );
  });
});

const topicFixture: Topic = {
  id: "topic-1",
  title: "Iran strike risk",
  framingQuestion: "Will tensions escalate?",
  scopeNote: "Track military and diplomatic signals.",
  reviewCadence: "weekly",
  status: "active",
  createdAt: "2026-04-25T00:00:00.000Z",
  updatedAt: "2026-04-25T00:00:00.000Z"
};

class FakeTopicRowStore implements TopicRowStore {
  private readonly topics = new Map<string, TopicRow>();

  async insertTopic(topic: NewTopicRow): Promise<TopicRow> {
    const row: TopicRow = {
      id: topic.id,
      title: topic.title,
      framingQuestion: topic.framingQuestion,
      scopeNote: topic.scopeNote ?? null,
      reviewCadence: topic.reviewCadence,
      status: topic.status,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt
    };

    this.topics.set(row.id, row);

    return row;
  }

  async selectTopicById(id: string): Promise<TopicRow | undefined> {
    return this.topics.get(id);
  }
}
