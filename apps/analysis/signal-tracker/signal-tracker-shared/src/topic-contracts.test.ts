import { describe, expect, it } from "vitest";

import { assessmentUpdateReadModelSchema } from "./assessment-contracts.js";
import {
  archiveTopicRequestSchema,
  archiveTopicResponseSchema,
  createTopicRequestSchema,
  createTopicResponseSchema,
  deleteTopicRequestSchema,
  deleteTopicResponseSchema,
  getTopicRequestSchema,
  getTopicResponseSchema,
  listTopicsRequestSchema,
  listTopicsResponseSchema,
  topicMetadataSchema,
  topicMetadataValidationMessages,
  topicSchema,
  topicStatusSchema,
  updateTopicRequestSchema,
  updateTopicResponseSchema
} from "./topic-contracts.js";

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

  it("uses shared topic metadata validation messages", () => {
    expect(
      topicMetadataSchema.safeParse({
        title: " ",
        framingQuestion: "What is being tracked?"
      }).error?.issues[0]?.message
    ).toBe(topicMetadataValidationMessages.title);
    expect(
      topicMetadataSchema.safeParse({
        title: "Ukraine ceasefire negotiations",
        framingQuestion: ""
      }).error?.issues[0]?.message
    ).toBe(topicMetadataValidationMessages.framingQuestion);
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

  it("validates the get-topic response shape without a current assessment", () => {
    const topic = topicSchema.parse({
      id: "topic-1",
      title: "Iran strike risk",
      framingQuestion: "Will tensions escalate?",
      status: "active",
      createdAt: "2026-04-25T00:00:00.000Z",
      updatedAt: "2026-04-25T00:00:00.000Z",
      reviewCadence: "weekly"
    });

    expect(
      getTopicResponseSchema.parse({ topic, currentAssessment: null })
    ).toEqual({
      topic,
      currentAssessment: null
    });
  });

  it("validates the get-topic response shape with a current assessment", () => {
    const topic = topicSchema.parse({
      id: "topic-1",
      title: "Iran strike risk",
      framingQuestion: "Will tensions escalate?",
      status: "active",
      createdAt: "2026-04-25T00:00:00.000Z",
      updatedAt: "2026-04-25T00:00:00.000Z",
      reviewCadence: "weekly"
    });
    const currentAssessment = assessmentUpdateReadModelSchema.parse({
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
        updatedAt: "2026-04-25T01:00:00.000Z",
        sources: []
      },
      judgment: "Escalation risk remains limited.",
      confidenceLabel: "medium",
      probabilityPct: 35,
      assumptions: ["Diplomatic channels remain open"],
      indicators: ["Watch for evacuation orders"]
    });

    expect(getTopicResponseSchema.parse({ topic, currentAssessment })).toEqual({
      topic,
      currentAssessment
    });
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

  it("validates topic archive and hard-delete request and response shapes", () => {
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
