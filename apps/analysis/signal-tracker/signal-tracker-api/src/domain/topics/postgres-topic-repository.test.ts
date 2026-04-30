import { describe, expect, it } from "vitest";

import type { Topic } from "@repo/signal-tracker-shared";

import {
  escapeIlikePattern,
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

  it("lists active topics in updated-first order", async () => {
    const store = new FakeTopicRowStore();
    const repository = new PostgresTopicRepository(store);
    store.seed(archivedTopicRow);
    store.seed({
      ...topicFixture,
      id: "topic-2",
      title: "AI copyright litigation",
      framingQuestion: "What legal risk is emerging?",
      scopeNote: undefined,
      createdAt: "2026-04-26T00:00:00.000Z",
      updatedAt: "2026-04-27T00:00:00.000Z"
    });
    store.seed(topicFixture);

    await expect(repository.list()).resolves.toEqual([
      {
        id: "topic-2",
        title: "AI copyright litigation",
        framingQuestion: "What legal risk is emerging?",
        reviewCadence: "weekly",
        status: "active",
        createdAt: "2026-04-26T00:00:00.000Z",
        updatedAt: "2026-04-27T00:00:00.000Z"
      },
      topicFixture
    ]);
  });

  it("uses created time and ID as stable tie-breakers", async () => {
    const store = new FakeTopicRowStore();
    const repository = new PostgresTopicRepository(store);
    store.seed({
      ...topicFixture,
      id: "topic-b",
      createdAt: "2026-04-26T00:00:00.000Z"
    });
    store.seed({
      ...topicFixture,
      id: "topic-a",
      createdAt: "2026-04-26T00:00:00.000Z"
    });
    store.seed({
      ...topicFixture,
      id: "topic-c",
      createdAt: "2026-04-27T00:00:00.000Z"
    });

    await expect(repository.list()).resolves.toMatchObject([
      { id: "topic-c" },
      { id: "topic-a" },
      { id: "topic-b" }
    ]);
  });

  it("filters listed topics by query", async () => {
    const store = new FakeTopicRowStore();
    const repository = new PostgresTopicRepository(store);
    store.seed(topicFixture);
    store.seed({
      ...topicFixture,
      id: "topic-2",
      title: "AI copyright litigation",
      framingQuestion: "What legal risk is emerging?",
      scopeNote: undefined
    });

    await expect(repository.list({ query: "diplomatic" })).resolves.toEqual([
      topicFixture
    ]);
  });

  it("escapes wildcard characters before building an ILIKE pattern", () => {
    expect(escapeIlikePattern(String.raw`50%_risk\test`)).toBe(
      String.raw`50\%\_risk\\test`
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

const archivedTopicRow: TopicRow = {
  id: "topic-archived",
  title: "Archived topic",
  framingQuestion: "What no longer needs review?",
  scopeNote: null,
  reviewCadence: "monthly",
  status: "archived",
  createdAt: new Date("2026-04-25T00:00:00.000Z"),
  updatedAt: new Date("2026-04-28T00:00:00.000Z")
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

  async selectTopics(options: { query?: string } = {}): Promise<TopicRow[]> {
    const query = options.query?.toLocaleLowerCase();

    return Array.from(this.topics.values())
      .filter((row) => row.status === "active")
      .filter((row) => {
        if (!query) {
          return true;
        }

        return [row.title, row.framingQuestion, row.scopeNote ?? ""].some(
          (value) => value.toLocaleLowerCase().includes(query)
        );
      })
      .sort(compareTopicRowsForList);
  }

  seed(topic: Topic): void;
  seed(row: TopicRow): void;
  seed(topicOrRow: Topic | TopicRow): void {
    const row: TopicRow = isTopicRow(topicOrRow)
      ? topicOrRow
      : {
          id: topicOrRow.id,
          title: topicOrRow.title,
          framingQuestion: topicOrRow.framingQuestion,
          scopeNote: topicOrRow.scopeNote ?? null,
          reviewCadence: topicOrRow.reviewCadence,
          status: topicOrRow.status,
          createdAt: new Date(topicOrRow.createdAt),
          updatedAt: new Date(topicOrRow.updatedAt)
        };

    this.topics.set(row.id, row);
  }
}

function isTopicRow(topicOrRow: Topic | TopicRow): topicOrRow is TopicRow {
  return topicOrRow.createdAt instanceof Date;
}

function compareTopicRowsForList(left: TopicRow, right: TopicRow): number {
  const updatedAtComparison =
    getTime(right.updatedAt) - getTime(left.updatedAt);

  if (updatedAtComparison !== 0) {
    return updatedAtComparison;
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
