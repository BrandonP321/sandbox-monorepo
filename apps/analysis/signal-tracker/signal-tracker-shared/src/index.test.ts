import { describe, expect, it } from "vitest";

import {
  archiveTopicRequestSchema,
  archiveTopicResponseSchema,
  createTopicRequestSchema,
  createTopicResponseSchema,
  deleteTopicRequestSchema,
  deleteTopicResponseSchema,
  getTopicRequestSchema,
  getTopicResponseSchema,
  isSignalTrackerRetryableDbErrorCode,
  listTopicsRequestSchema,
  listTopicsResponseSchema,
  signalTrackerApiErrorCodes,
  signalTrackerHealthResponseSchema,
  signalTrackerRetryableDbErrorCodes,
  signalTrackerRouteEntries,
  signalTrackerRouteList,
  signalTrackerRoutes,
  topicStatusSchema,
  updateTopicRequestSchema,
  updateTopicResponseSchema,
  topicSchema
} from "./index.js";

describe("signalTrackerRoutes", () => {
  it("defines the signal tracker API routes once for all consumers", () => {
    expect(signalTrackerRoutes.createTopic).toEqual({
      method: "POST",
      path: "/create-topic"
    });
    expect(signalTrackerRoutes.getTopic).toEqual({
      method: "POST",
      path: "/get-topic"
    });
    expect(signalTrackerRoutes.listTopics).toEqual({
      method: "POST",
      path: "/list-topics"
    });
    expect(signalTrackerRoutes.updateTopic).toEqual({
      method: "POST",
      path: "/update-topic"
    });
    expect(signalTrackerRoutes.archiveTopic).toEqual({
      method: "POST",
      path: "/archive-topic"
    });
    expect(signalTrackerRoutes.deleteTopic).toEqual({
      method: "POST",
      path: "/delete-topic"
    });
    expect(signalTrackerRoutes.getHealth).toEqual({
      method: "POST",
      path: "/get-health"
    });
  });

  it("exposes stable list and entry helpers", () => {
    expect(
      signalTrackerRouteEntries.map(
        ([name]: (typeof signalTrackerRouteEntries)[number]) => name
      )
    ).toEqual([
      "createTopic",
      "getTopic",
      "listTopics",
      "updateTopic",
      "archiveTopic",
      "deleteTopic",
      "getHealth"
    ]);
    expect(signalTrackerRouteList).toEqual([
      signalTrackerRoutes.createTopic,
      signalTrackerRoutes.getTopic,
      signalTrackerRoutes.listTopics,
      signalTrackerRoutes.updateTopic,
      signalTrackerRoutes.archiveTopic,
      signalTrackerRoutes.deleteTopic,
      signalTrackerRoutes.getHealth
    ]);
  });

  it("validates the health response payload", () => {
    const payload = signalTrackerHealthResponseSchema.parse({ ok: true });

    expect(payload.ok).toBe(true);
  });
});

describe("signalTracker API error conventions", () => {
  it("classifies retryable DB-backed API errors", () => {
    expect(signalTrackerRetryableDbErrorCodes).toEqual([
      "PERSISTENCE_UNAVAILABLE",
      "DATABASE_UNAVAILABLE",
      "DATABASE_WAKING",
      "REQUEST_TIMEOUT"
    ]);

    expect(
      isSignalTrackerRetryableDbErrorCode(
        signalTrackerApiErrorCodes.persistenceUnavailable
      )
    ).toBe(true);
    expect(isSignalTrackerRetryableDbErrorCode("VALIDATION_ERROR")).toBe(false);
  });
});

describe("topic contracts", () => {
  it("validates topic lifecycle status values", () => {
    expect(topicStatusSchema.options).toEqual(["active", "paused", "archived"]);
  });

  it("validates a topic creation request and defaults review cadence", () => {
    const payload = createTopicRequestSchema.parse({
      title: "  Iran strike risk  ",
      framingQuestion: " Will tensions escalate? ",
      scopeNote: "  Track military and diplomatic signals.  "
    });

    expect(payload).toEqual({
      title: "Iran strike risk",
      framingQuestion: "Will tensions escalate?",
      scopeNote: "Track military and diplomatic signals.",
      reviewCadence: "ad_hoc"
    });
  });

  it("omits a blank scope note", () => {
    const payload = createTopicRequestSchema.parse({
      title: "AI copyright litigation",
      framingQuestion: "What legal risk is emerging?",
      scopeNote: " "
    });

    expect(payload.scopeNote).toBeUndefined();
  });

  it("rejects a missing topic title", () => {
    expect(() =>
      createTopicRequestSchema.parse({
        title: " ",
        framingQuestion: "What is being tracked?"
      })
    ).toThrow();
  });

  it("rejects a missing framing question", () => {
    expect(() =>
      createTopicRequestSchema.parse({
        title: "Ukraine ceasefire negotiations",
        framingQuestion: ""
      })
    ).toThrow();
  });

  it("rejects an invalid review cadence", () => {
    expect(() =>
      createTopicRequestSchema.parse({
        title: "Fed independence debate",
        framingQuestion: "Will institutional constraints hold?",
        reviewCadence: "daily"
      })
    ).toThrow();
  });

  it("validates the topic and create-topic response shapes", () => {
    const topic = topicSchema.parse({
      id: "topic-1",
      title: "Iran strike risk",
      framingQuestion: "Will tensions escalate?",
      status: "active",
      createdAt: "2026-04-25T00:00:00.000Z",
      updatedAt: "2026-04-25T00:00:00.000Z",
      archivedAt: "2026-04-26T00:00:00.000Z",
      reviewCadence: "weekly"
    });

    expect(createTopicResponseSchema.parse({ topic })).toEqual({ topic });
  });

  it("validates a topic read request", () => {
    expect(getTopicRequestSchema.parse({ topicId: " topic-1 " })).toEqual({
      topicId: "topic-1"
    });
  });

  it("rejects a blank topic read ID", () => {
    expect(() => getTopicRequestSchema.parse({ topicId: " " })).toThrow();
  });

  it("validates the get-topic response shape", () => {
    const topic = topicSchema.parse({
      id: "topic-1",
      title: "Iran strike risk",
      framingQuestion: "Will tensions escalate?",
      status: "active",
      createdAt: "2026-04-25T00:00:00.000Z",
      updatedAt: "2026-04-25T00:00:00.000Z",
      reviewCadence: "weekly"
    });

    expect(getTopicResponseSchema.parse({ topic })).toEqual({ topic });
  });

  it("validates a topic list request and trims the query", () => {
    expect(listTopicsRequestSchema.parse({ query: " strike risk " })).toEqual({
      query: "strike risk"
    });
  });

  it("omits a blank topic list query", () => {
    expect(listTopicsRequestSchema.parse({ query: " " })).toEqual({});
    expect(listTopicsRequestSchema.parse({})).toEqual({});
  });

  it("validates the list-topics response shape", () => {
    const topic = topicSchema.parse({
      id: "topic-1",
      title: "Iran strike risk",
      framingQuestion: "Will tensions escalate?",
      status: "active",
      createdAt: "2026-04-25T00:00:00.000Z",
      updatedAt: "2026-04-25T00:00:00.000Z",
      reviewCadence: "weekly"
    });

    expect(listTopicsResponseSchema.parse({ topics: [] })).toEqual({
      topics: []
    });
    expect(listTopicsResponseSchema.parse({ topics: [topic] })).toEqual({
      topics: [topic]
    });
  });

  it("validates topic metadata update requests", () => {
    expect(
      updateTopicRequestSchema.parse({
        topicId: " topic-1 ",
        title: " Iran strike risk ",
        framingQuestion: " Will tensions escalate? ",
        scopeNote: " Track military and diplomatic signals. ",
        reviewCadence: "weekly"
      })
    ).toEqual({
      topicId: "topic-1",
      title: "Iran strike risk",
      framingQuestion: "Will tensions escalate?",
      scopeNote: "Track military and diplomatic signals.",
      reviewCadence: "weekly"
    });
  });

  it("treats null or blank update scope notes as a clear request", () => {
    expect(
      updateTopicRequestSchema.parse({
        topicId: "topic-1",
        scopeNote: null
      })
    ).toEqual({
      topicId: "topic-1",
      scopeNote: null
    });

    expect(
      updateTopicRequestSchema.parse({
        topicId: "topic-1",
        scopeNote: " "
      })
    ).toEqual({
      topicId: "topic-1",
      scopeNote: null
    });
  });

  it("rejects invalid topic metadata update requests", () => {
    expect(() =>
      updateTopicRequestSchema.parse({
        topicId: "topic-1"
      })
    ).toThrow();
    expect(() =>
      updateTopicRequestSchema.parse({
        topicId: "topic-1",
        title: " "
      })
    ).toThrow();
    expect(() =>
      updateTopicRequestSchema.parse({
        topicId: "topic-1",
        framingQuestion: " "
      })
    ).toThrow();
    expect(() =>
      updateTopicRequestSchema.parse({
        topicId: "topic-1",
        reviewCadence: "daily"
      })
    ).toThrow();
  });

  it("validates topic lifecycle request and response shapes", () => {
    const topic = topicSchema.parse({
      id: "topic-1",
      title: "Iran strike risk",
      framingQuestion: "Will tensions escalate?",
      status: "archived",
      createdAt: "2026-04-25T00:00:00.000Z",
      updatedAt: "2026-04-26T00:00:00.000Z",
      archivedAt: "2026-04-26T00:00:00.000Z",
      reviewCadence: "weekly"
    });

    expect(archiveTopicRequestSchema.parse({ topicId: " topic-1 " })).toEqual({
      topicId: "topic-1"
    });
    expect(deleteTopicRequestSchema.parse({ topicId: " topic-1 " })).toEqual({
      topicId: "topic-1"
    });
    expect(updateTopicResponseSchema.parse({ topic })).toEqual({ topic });
    expect(archiveTopicResponseSchema.parse({ topic })).toEqual({ topic });
    expect(deleteTopicResponseSchema.parse({ topic })).toEqual({ topic });
  });
});
