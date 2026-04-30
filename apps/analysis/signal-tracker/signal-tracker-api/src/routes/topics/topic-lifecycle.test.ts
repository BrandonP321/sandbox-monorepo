import { describe, expect, it, vi } from "vitest";

import type { Topic } from "@repo/signal-tracker-shared";

import { InMemoryTopicRepository } from "../../domain/topics/topic-repository";
import { createArchiveTopicHandler } from "./archive-topic";
import { createDeleteTopicHandler } from "./delete-topic";
import { createGetTopicHandler } from "./get-topic";
import { createListTopicsHandler } from "./list-topics";
import { createUpdateTopicHandler } from "./update-topic";

describe("topic lifecycle routes", () => {
  it("updates topic metadata and leaves omitted fields unchanged", async () => {
    const repository = new InMemoryTopicRepository();
    await repository.create(topicFixture);
    const handler = createUpdateTopicHandler({
      repository,
      now: () => new Date("2026-04-27T00:00:00.000Z")
    });

    const result = await handler({
      method: "POST",
      path: "/update-topic",
      body: JSON.stringify({
        topicId: " topic-1 ",
        title: " Updated strike risk ",
        reviewCadence: "monthly"
      })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      topic: {
        ...topicFixture,
        title: "Updated strike risk",
        reviewCadence: "monthly",
        updatedAt: "2026-04-27T00:00:00.000Z"
      }
    });
  });

  it("clears a scope note through metadata updates", async () => {
    const repository = new InMemoryTopicRepository();
    await repository.create(topicFixture);
    const handler = createUpdateTopicHandler({
      repository,
      now: () => new Date("2026-04-27T00:00:00.000Z")
    });

    const result = await handler({
      method: "POST",
      path: "/update-topic",
      body: JSON.stringify({
        topicId: "topic-1",
        scopeNote: null
      })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      topic: {
        id: topicFixture.id,
        title: topicFixture.title,
        framingQuestion: topicFixture.framingQuestion,
        reviewCadence: topicFixture.reviewCadence,
        status: topicFixture.status,
        createdAt: topicFixture.createdAt,
        updatedAt: "2026-04-27T00:00:00.000Z"
      }
    });
  });

  it("archives a topic and excludes it from the active topic list", async () => {
    const repository = new InMemoryTopicRepository();
    await repository.create(topicFixture);
    const archiveHandler = createArchiveTopicHandler({
      repository,
      now: () => new Date("2026-04-27T00:00:00.000Z")
    });

    const archiveResult = await archiveHandler({
      method: "POST",
      path: "/archive-topic",
      body: JSON.stringify({ topicId: "topic-1" })
    });

    const archivedTopic = {
      ...topicFixture,
      status: "archived",
      updatedAt: "2026-04-27T00:00:00.000Z",
      archivedAt: "2026-04-27T00:00:00.000Z"
    };
    expect(archiveResult.statusCode).toBe(200);
    expect(JSON.parse(archiveResult.body)).toEqual({
      topic: archivedTopic
    });

    const listResult = await createListTopicsHandler({ repository })({
      method: "POST",
      path: "/list-topics",
      body: undefined
    });
    expect(JSON.parse(listResult.body)).toEqual({ topics: [] });

    const getResult = await createGetTopicHandler({ repository })({
      method: "POST",
      path: "/get-topic",
      body: JSON.stringify({ topicId: "topic-1" })
    });
    expect(JSON.parse(getResult.body)).toEqual({ topic: archivedTopic });
  });

  it("hard deletes a topic and removes it from list and direct reads", async () => {
    const repository = new InMemoryTopicRepository();
    await repository.create(topicFixture);
    const deleteHandler = createDeleteTopicHandler({ repository });

    const deleteResult = await deleteHandler({
      method: "POST",
      path: "/delete-topic",
      body: JSON.stringify({ topicId: "topic-1" })
    });

    expect(deleteResult.statusCode).toBe(200);
    expect(JSON.parse(deleteResult.body)).toEqual({
      topic: topicFixture
    });

    const listResult = await createListTopicsHandler({ repository })({
      method: "POST",
      path: "/list-topics",
      body: undefined
    });
    expect(JSON.parse(listResult.body)).toEqual({ topics: [] });

    await expect(
      createGetTopicHandler({ repository })({
        method: "POST",
        path: "/get-topic",
        body: JSON.stringify({ topicId: "topic-1" })
      })
    ).rejects.toMatchObject({
      code: "TOPIC_NOT_FOUND",
      statusCode: 404
    });
  });

  it("returns not found for lifecycle requests against missing topics", async () => {
    const repository = new InMemoryTopicRepository();

    await expect(
      createUpdateTopicHandler({ repository })({
        method: "POST",
        path: "/update-topic",
        body: JSON.stringify({ topicId: "missing-topic", title: "Updated" })
      })
    ).rejects.toMatchObject({
      code: "TOPIC_NOT_FOUND",
      statusCode: 404
    });

    await expect(
      createArchiveTopicHandler({ repository })({
        method: "POST",
        path: "/archive-topic",
        body: JSON.stringify({ topicId: "missing-topic" })
      })
    ).rejects.toMatchObject({
      code: "TOPIC_NOT_FOUND",
      statusCode: 404
    });

    await expect(
      createDeleteTopicHandler({ repository })({
        method: "POST",
        path: "/delete-topic",
        body: JSON.stringify({ topicId: "missing-topic" })
      })
    ).rejects.toMatchObject({
      code: "TOPIC_NOT_FOUND",
      statusCode: 404
    });
  });

  it("returns validation errors for invalid lifecycle requests", async () => {
    const repository = new InMemoryTopicRepository();

    await expect(
      createUpdateTopicHandler({ repository })({
        method: "POST",
        path: "/update-topic",
        body: JSON.stringify({ topicId: "topic-1" })
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });

    await expect(
      createArchiveTopicHandler({ repository })({
        method: "POST",
        path: "/archive-topic",
        body: JSON.stringify({ topicId: " " })
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });

    await expect(
      createDeleteTopicHandler({ repository })({
        method: "POST",
        path: "/delete-topic",
        body: "{"
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
  });

  it("returns persistence unavailable when lifecycle storage fails", async () => {
    const repository = failingRepository();

    await expect(
      createUpdateTopicHandler({ repository })({
        method: "POST",
        path: "/update-topic",
        body: JSON.stringify({ topicId: "topic-1", title: "Updated" })
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });

    await expect(
      createArchiveTopicHandler({ repository })({
        method: "POST",
        path: "/archive-topic",
        body: JSON.stringify({ topicId: "topic-1" })
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });

    await expect(
      createDeleteTopicHandler({ repository })({
        method: "POST",
        path: "/delete-topic",
        body: JSON.stringify({ topicId: "topic-1" })
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });
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

function failingRepository() {
  return {
    create: vi.fn(async (topic: Topic): Promise<Topic> => topic),
    findById: vi.fn(async (): Promise<Topic | undefined> => undefined),
    list: vi.fn(async (): Promise<Topic[]> => []),
    update: vi.fn(async () => {
      throw new Error("database unavailable");
    }),
    archive: vi.fn(async () => {
      throw new Error("database unavailable");
    }),
    delete: vi.fn(async () => {
      throw new Error("database unavailable");
    })
  };
}
