import { describe, expect, it } from "vitest";

import {
  createTopicRequestSchema,
  createTopicResponseSchema,
  getTopicRequestSchema,
  getTopicResponseSchema,
  signalTrackerHealthResponseSchema,
  signalTrackerRouteEntries,
  signalTrackerRouteList,
  signalTrackerRoutes,
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
    ).toEqual(["createTopic", "getTopic", "getHealth"]);
    expect(signalTrackerRouteList).toEqual([
      signalTrackerRoutes.createTopic,
      signalTrackerRoutes.getTopic,
      signalTrackerRoutes.getHealth
    ]);
  });

  it("validates the health response payload", () => {
    const payload = signalTrackerHealthResponseSchema.parse({ ok: true });

    expect(payload.ok).toBe(true);
  });
});

describe("topic contracts", () => {
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
});
