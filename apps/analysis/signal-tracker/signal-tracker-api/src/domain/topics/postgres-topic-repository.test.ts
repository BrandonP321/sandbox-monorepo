import { describe, expect, it } from "vitest";

import { FakeTopicRowStore } from "../repository-test-stores";
import { buildTopicFixture, buildTopicRowFixture } from "../test-fixtures";
import {
  escapeIlikePattern,
  mapTopicRow,
  PostgresTopicRepository
} from "./postgres-topic-repository";

describe("PostgresTopicRepository", () => {
  it("maps topic rows to the shared API topic shape", () => {
    expect(
      mapTopicRow(
        buildTopicRowFixture({
          scopeNote: null
        })
      )
    ).toEqual(
      buildTopicFixture({
        scopeNote: undefined
      })
    );
  });

  it("maps archived timestamps to the shared API topic shape", () => {
    expect(
      mapTopicRow(
        buildTopicRowFixture({
          scopeNote: null,
          status: "archived",
          updatedAt: new Date("2026-04-27T00:00:00.000Z"),
          archivedAt: new Date("2026-04-26T00:00:00.000Z")
        })
      )
    ).toEqual(
      buildTopicFixture({
        scopeNote: undefined,
        status: "archived",
        updatedAt: "2026-04-27T00:00:00.000Z",
        archivedAt: "2026-04-26T00:00:00.000Z"
      })
    );
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
    store.seed(
      buildTopicFixture({
        id: "topic-2",
        title: "AI copyright litigation",
        framingQuestion: "What legal risk is emerging?",
        scopeNote: undefined,
        createdAt: "2026-04-26T00:00:00.000Z",
        updatedAt: "2026-04-27T00:00:00.000Z"
      })
    );
    store.seed(topicFixture);

    await expect(repository.list()).resolves.toEqual([
      buildTopicFixture({
        id: "topic-2",
        title: "AI copyright litigation",
        framingQuestion: "What legal risk is emerging?",
        scopeNote: undefined,
        createdAt: "2026-04-26T00:00:00.000Z",
        updatedAt: "2026-04-27T00:00:00.000Z"
      }),
      topicFixture
    ]);
  });

  it("uses created time and ID as stable tie-breakers", async () => {
    const store = new FakeTopicRowStore();
    const repository = new PostgresTopicRepository(store);
    store.seed(
      buildTopicFixture({
        id: "topic-b",
        createdAt: "2026-04-26T00:00:00.000Z"
      })
    );
    store.seed(
      buildTopicFixture({
        id: "topic-a",
        createdAt: "2026-04-26T00:00:00.000Z"
      })
    );
    store.seed(
      buildTopicFixture({
        id: "topic-c",
        createdAt: "2026-04-27T00:00:00.000Z"
      })
    );

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
    store.seed(
      buildTopicFixture({
        id: "topic-2",
        title: "AI copyright litigation",
        framingQuestion: "What legal risk is emerging?",
        scopeNote: undefined
      })
    );

    await expect(repository.list({ query: "diplomatic" })).resolves.toEqual([
      topicFixture
    ]);
  });

  it("updates editable topic metadata and clears scope notes", async () => {
    const store = new FakeTopicRowStore();
    const repository = new PostgresTopicRepository(store);
    store.seed(topicFixture);

    await expect(
      repository.update(
        topicFixture.id,
        {
          title: "Updated Iran strike risk",
          scopeNote: null
        },
        "2026-04-27T00:00:00.000Z"
      )
    ).resolves.toEqual({
      ...topicFixture,
      title: "Updated Iran strike risk",
      scopeNote: undefined,
      updatedAt: "2026-04-27T00:00:00.000Z"
    });
  });

  it("archives topics and keeps them directly readable", async () => {
    const store = new FakeTopicRowStore();
    const repository = new PostgresTopicRepository(store);
    store.seed(topicFixture);

    await expect(
      repository.archive(topicFixture.id, "2026-04-27T00:00:00.000Z")
    ).resolves.toEqual({
      ...topicFixture,
      status: "archived",
      updatedAt: "2026-04-27T00:00:00.000Z",
      archivedAt: "2026-04-27T00:00:00.000Z"
    });
    await expect(repository.list()).resolves.toEqual([]);
    await expect(repository.findById(topicFixture.id)).resolves.toMatchObject({
      id: topicFixture.id,
      status: "archived"
    });
  });

  it("hard deletes topics and removes them from normal reads", async () => {
    const store = new FakeTopicRowStore();
    const repository = new PostgresTopicRepository(store);
    store.seed(topicFixture);

    await expect(repository.delete(topicFixture.id)).resolves.toEqual(
      topicFixture
    );
    await expect(repository.list()).resolves.toEqual([]);
    await expect(repository.findById(topicFixture.id)).resolves.toBeUndefined();
  });

  it("escapes wildcard characters before building an ILIKE pattern", () => {
    expect(escapeIlikePattern(String.raw`50%_risk\test`)).toBe(
      String.raw`50\%\_risk\\test`
    );
  });
});

const topicFixture = buildTopicFixture();

const archivedTopicRow = buildTopicRowFixture({
  id: "topic-archived",
  title: "Archived topic",
  framingQuestion: "What no longer needs review?",
  scopeNote: null,
  reviewCadence: "monthly",
  status: "archived",
  createdAt: new Date("2026-04-25T00:00:00.000Z"),
  updatedAt: new Date("2026-04-28T00:00:00.000Z"),
  archivedAt: new Date("2026-04-28T00:00:00.000Z")
});
