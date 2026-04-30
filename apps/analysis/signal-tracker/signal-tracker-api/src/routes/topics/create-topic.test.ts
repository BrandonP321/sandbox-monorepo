import { describe, expect, it, vi } from "vitest";

import type { Topic } from "@repo/signal-tracker-shared";

import { createCreateTopicHandler } from "./create-topic";

describe("createTopic route", () => {
  const repository = {
    create: vi.fn(async (topic: Topic): Promise<Topic> => topic),
    findById: vi.fn(async (): Promise<Topic | undefined> => undefined),
    list: vi.fn(async (): Promise<Topic[]> => []),
    update: vi.fn(async (): Promise<Topic | undefined> => undefined),
    archive: vi.fn(async (): Promise<Topic | undefined> => undefined),
    delete: vi.fn(async (): Promise<Topic | undefined> => undefined)
  };

  it("creates a topic from a valid request", async () => {
    const handler = createCreateTopicHandler({
      repository,
      createId: () => "topic-1",
      now: () => new Date("2026-04-25T00:00:00.000Z")
    });

    const result = await handler({
      method: "POST",
      path: "/create-topic",
      body: JSON.stringify({
        title: " Iran strike risk ",
        framingQuestion: " Will tensions escalate? ",
        scopeNote: " Track military and diplomatic signals. ",
        reviewCadence: "weekly"
      })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      topic: {
        id: "topic-1",
        title: "Iran strike risk",
        framingQuestion: "Will tensions escalate?",
        status: "active",
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z",
        scopeNote: "Track military and diplomatic signals.",
        reviewCadence: "weekly"
      }
    });
  });

  it("defaults review cadence and omits blank scope notes", async () => {
    const handler = createCreateTopicHandler({
      repository,
      createId: () => "topic-2",
      now: () => new Date("2026-04-25T00:00:00.000Z")
    });

    const result = await handler({
      method: "POST",
      path: "/create-topic",
      body: JSON.stringify({
        title: "AI copyright litigation",
        framingQuestion: "What legal risk is emerging?",
        scopeNote: " "
      })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      topic: {
        id: "topic-2",
        title: "AI copyright litigation",
        framingQuestion: "What legal risk is emerging?",
        status: "active",
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z",
        reviewCadence: "ad_hoc"
      }
    });
  });

  it("returns a validation error for invalid JSON", async () => {
    const handler = createCreateTopicHandler({
      repository
    });

    await expect(
      handler({
        method: "POST",
        path: "/create-topic",
        body: "{"
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
  });

  it("returns a validation error for missing title", async () => {
    const handler = createCreateTopicHandler({
      repository
    });

    await expect(
      handler({
        method: "POST",
        path: "/create-topic",
        body: JSON.stringify({
          framingQuestion: "What is being tracked?"
        })
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
  });

  it("returns a validation error for missing framing question", async () => {
    const handler = createCreateTopicHandler({
      repository
    });

    await expect(
      handler({
        method: "POST",
        path: "/create-topic",
        body: JSON.stringify({
          title: "Ukraine ceasefire negotiations"
        })
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
  });

  it("returns a validation error for invalid review cadence", async () => {
    const handler = createCreateTopicHandler({
      repository
    });

    await expect(
      handler({
        method: "POST",
        path: "/create-topic",
        body: JSON.stringify({
          title: "Fed independence debate",
          framingQuestion: "Will institutional constraints hold?",
          reviewCadence: "daily"
        })
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
  });

  it("returns a persistence unavailable error when topic storage fails", async () => {
    const handler = createCreateTopicHandler({
      repository: {
        create: vi.fn(async () => {
          throw new Error("database unavailable");
        }),
        findById: vi.fn(async (): Promise<Topic | undefined> => undefined),
        list: vi.fn(async (): Promise<Topic[]> => []),
        update: vi.fn(async (): Promise<Topic | undefined> => undefined),
        archive: vi.fn(async (): Promise<Topic | undefined> => undefined),
        delete: vi.fn(async (): Promise<Topic | undefined> => undefined)
      },
      createId: () => "topic-3",
      now: () => new Date("2026-04-25T00:00:00.000Z")
    });

    await expect(
      handler({
        method: "POST",
        path: "/create-topic",
        body: JSON.stringify({
          title: "Fed independence debate",
          framingQuestion: "Will institutional constraints hold?"
        })
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });
  });
});
