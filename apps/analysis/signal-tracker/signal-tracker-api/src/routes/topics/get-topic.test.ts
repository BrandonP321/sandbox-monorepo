import { describe, expect, it, vi } from "vitest";

import type { AssessmentUpdate, Topic } from "@repo/signal-tracker-shared";

import { createGetTopicHandler } from "./get-topic";

describe("getTopic route", () => {
  it("returns a topic from a valid request", async () => {
    const handler = createGetTopicHandler({
      repository: {
        findById: vi.fn(async (): Promise<Topic | undefined> => topicFixture)
      },
      assessmentRepository: {
        findLatestActiveByTopic: vi.fn(
          async (): Promise<AssessmentUpdate | undefined> =>
            assessmentUpdateFixture
        )
      }
    });

    const result = await handler({
      method: "POST",
      path: "/get-topic",
      body: JSON.stringify({ topicId: " topic-1 " })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      topic: topicFixture,
      currentAssessment: assessmentUpdateFixture
    });
  });

  it("returns null current assessment when a topic has no assessment updates", async () => {
    const handler = createGetTopicHandler({
      repository: {
        findById: vi.fn(async (): Promise<Topic | undefined> => topicFixture)
      },
      assessmentRepository: emptyAssessmentRepository
    });

    const result = await handler({
      method: "POST",
      path: "/get-topic",
      body: JSON.stringify({ topicId: "topic-1" })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      topic: topicFixture,
      currentAssessment: null
    });
  });

  it("returns a validation error for invalid JSON", async () => {
    const handler = createGetTopicHandler({
      repository: emptyRepository,
      assessmentRepository: emptyAssessmentRepository
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
      repository: emptyRepository,
      assessmentRepository: emptyAssessmentRepository
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
      repository: emptyRepository,
      assessmentRepository: emptyAssessmentRepository
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
      repository: emptyRepository,
      assessmentRepository: emptyAssessmentRepository
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
        findById: vi.fn(async () => {
          throw new Error("database unavailable");
        })
      },
      assessmentRepository: emptyAssessmentRepository
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

  it("returns a persistence unavailable error when assessment storage fails", async () => {
    const handler = createGetTopicHandler({
      repository: {
        findById: vi.fn(async (): Promise<Topic | undefined> => topicFixture)
      },
      assessmentRepository: {
        findLatestActiveByTopic: vi.fn(async () => {
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
  findById: vi.fn(async (): Promise<Topic | undefined> => undefined)
};

const emptyAssessmentRepository = {
  findLatestActiveByTopic: vi.fn(
    async (): Promise<AssessmentUpdate | undefined> => undefined
  )
};

const assessmentUpdateFixture: AssessmentUpdate = {
  entry: {
    id: "assessment-1",
    topicId: "topic-1",
    kind: "assessment",
    epistemicStatus: "forecast",
    title: "Assessment update - 2026-04-25",
    bodyMd: "Escalation risk remains limited.",
    sortAt: "2026-04-25T00:00:00.000Z",
    isApproximateDate: false,
    originType: "manual",
    status: "active",
    createdAt: "2026-04-25T01:00:00.000Z",
    updatedAt: "2026-04-25T01:00:00.000Z"
  },
  judgment: "Escalation risk remains limited.",
  confidenceLabel: "medium",
  probabilityPct: 35,
  assumptions: ["Diplomatic channels remain open"],
  indicators: ["Watch for evacuation orders"],
  resolutionCriteria: undefined,
  targetResolvesAt: undefined,
  previousAssessmentEntryId: undefined
};
