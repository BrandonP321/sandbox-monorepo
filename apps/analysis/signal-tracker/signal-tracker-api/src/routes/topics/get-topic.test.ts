import { describe, expect, it, vi } from "vitest";

import type { Topic } from "@repo/signal-tracker-shared";

import { createGetTopicHandler } from "./get-topic";

describe("getTopic route", () => {
  it("returns a topic from a valid request", async () => {
    const handler = createGetTopicHandler({
      repository: {
        create: vi.fn(async (topic: Topic): Promise<Topic> => topic),
        findById: vi.fn(async (): Promise<Topic | undefined> => topicFixture)
      }
    });

    const result = await handler({
      method: "POST",
      path: "/get-topic",
      body: JSON.stringify({ topicId: " topic-1 " })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ topic: topicFixture });
  });

  it("returns a validation error for invalid JSON", async () => {
    const handler = createGetTopicHandler({
      repository: emptyRepository
    });

    await expect(
      handler({
        method: "POST",
        path: "/get-topic",
        body: "{"
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
  });

  it("returns a validation error for missing topic ID", async () => {
    const handler = createGetTopicHandler({
      repository: emptyRepository
    });

    await expect(
      handler({
        method: "POST",
        path: "/get-topic",
        body: JSON.stringify({})
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
  });

  it("returns a validation error for blank topic ID", async () => {
    const handler = createGetTopicHandler({
      repository: emptyRepository
    });

    await expect(
      handler({
        method: "POST",
        path: "/get-topic",
        body: JSON.stringify({ topicId: " " })
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
  });

  it("returns a not found error when the topic does not exist", async () => {
    const handler = createGetTopicHandler({
      repository: emptyRepository
    });

    await expect(
      handler({
        method: "POST",
        path: "/get-topic",
        body: JSON.stringify({ topicId: "topic-missing" })
      })
    ).rejects.toMatchObject({
      code: "TOPIC_NOT_FOUND",
      statusCode: 404
    });
  });

  it("returns a persistence unavailable error when topic storage fails", async () => {
    const handler = createGetTopicHandler({
      repository: {
        create: vi.fn(async (topic: Topic): Promise<Topic> => topic),
        findById: vi.fn(async () => {
          throw new Error("database unavailable");
        })
      }
    });

    await expect(
      handler({
        method: "POST",
        path: "/get-topic",
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

const emptyRepository = {
  create: vi.fn(async (topic: Topic): Promise<Topic> => topic),
  findById: vi.fn(async (): Promise<Topic | undefined> => undefined)
};
