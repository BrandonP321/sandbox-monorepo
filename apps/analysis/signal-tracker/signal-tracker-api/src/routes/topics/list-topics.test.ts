import { describe, expect, it, vi } from "vitest";

import type { Topic } from "@repo/signal-tracker-shared";

import { InMemoryTopicRepository } from "../../domain/topics/topic-repository";
import { createListTopicsHandler } from "./list-topics";

describe("listTopics route", () => {
  it("returns active topics in updated-first order", async () => {
    const repository = new InMemoryTopicRepository();
    await repository.create(olderTopic);
    await repository.create(newerTopic);

    const handler = createListTopicsHandler({ repository });

    const result = await handler({
      method: "POST",
      path: "/list-topics",
      body: undefined
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      topics: [newerTopic, olderTopic]
    });
  });

  it("returns an empty array when no topics match", async () => {
    const repository = new InMemoryTopicRepository();
    await repository.create(olderTopic);

    const handler = createListTopicsHandler({ repository });

    const result = await handler({
      method: "POST",
      path: "/list-topics",
      body: JSON.stringify({ query: "copyright" })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ topics: [] });
  });

  it("passes a trimmed query to the repository", async () => {
    const repository = {
      create: vi.fn(async (topic: Topic): Promise<Topic> => topic),
      findById: vi.fn(async (): Promise<Topic | undefined> => undefined),
      list: vi.fn(async (): Promise<Topic[]> => [newerTopic])
    };
    const handler = createListTopicsHandler({ repository });

    const result = await handler({
      method: "POST",
      path: "/list-topics",
      body: JSON.stringify({ query: " risk " })
    });

    expect(result.statusCode).toBe(200);
    expect(repository.list).toHaveBeenCalledWith({ query: "risk" });
  });

  it("filters topics by query", async () => {
    const repository = new InMemoryTopicRepository();
    await repository.create(olderTopic);
    await repository.create(newerTopic);

    const handler = createListTopicsHandler({ repository });

    const result = await handler({
      method: "POST",
      path: "/list-topics",
      body: JSON.stringify({ query: "diplomatic" })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ topics: [olderTopic] });
  });

  it("returns a validation error for invalid JSON", async () => {
    const handler = createListTopicsHandler({
      repository: new InMemoryTopicRepository()
    });

    await expect(
      handler({
        method: "POST",
        path: "/list-topics",
        body: "{"
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
  });

  it("returns a validation error for invalid request shape", async () => {
    const handler = createListTopicsHandler({
      repository: new InMemoryTopicRepository()
    });

    await expect(
      handler({
        method: "POST",
        path: "/list-topics",
        body: JSON.stringify({ query: 42 })
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
  });

  it("returns a persistence unavailable error when topic storage fails", async () => {
    const handler = createListTopicsHandler({
      repository: {
        create: vi.fn(async (topic: Topic): Promise<Topic> => topic),
        findById: vi.fn(async (): Promise<Topic | undefined> => undefined),
        list: vi.fn(async () => {
          throw new Error("database unavailable");
        })
      }
    });

    await expect(
      handler({
        method: "POST",
        path: "/list-topics",
        body: JSON.stringify({})
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });
  });
});

const olderTopic: Topic = {
  id: "topic-1",
  title: "Iran strike risk",
  framingQuestion: "Will tensions escalate?",
  scopeNote: "Track military and diplomatic signals.",
  reviewCadence: "weekly",
  status: "active",
  createdAt: "2026-04-25T00:00:00.000Z",
  updatedAt: "2026-04-26T00:00:00.000Z"
};

const newerTopic: Topic = {
  id: "topic-2",
  title: "AI copyright litigation",
  framingQuestion: "What legal risk is emerging?",
  scopeNote: undefined,
  reviewCadence: "ad_hoc",
  status: "active",
  createdAt: "2026-04-26T00:00:00.000Z",
  updatedAt: "2026-04-27T00:00:00.000Z"
};
