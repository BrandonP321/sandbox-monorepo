import { describe, expect, it } from "vitest";

import {
  assessmentTimelineMetadataSchema,
  listTopicTimelineRequestSchema,
  listTopicTimelineResponseSchema,
  topicTimelineItemSchema
} from "./timeline-contracts.js";

describe("timeline contracts", () => {
  it("validates full-history and recent timeline requests", () => {
    expect(
      listTopicTimelineRequestSchema.parse({ topicId: " topic-1 " })
    ).toEqual({
      topicId: "topic-1"
    });
    expect(
      listTopicTimelineRequestSchema.parse({
        topicId: " topic-1 ",
        limit: 10
      })
    ).toEqual({
      topicId: "topic-1",
      limit: 10
    });
  });

  it("rejects invalid timeline requests", () => {
    for (const request of [
      {},
      { topicId: " " },
      { topicId: "topic-1", limit: 0 },
      { topicId: "topic-1", limit: -1 },
      { topicId: "topic-1", limit: 1.5 },
      { topicId: "topic-1", limit: "10" }
    ]) {
      expect(() => listTopicTimelineRequestSchema.parse(request)).toThrow();
    }
  });

  it("validates timeline response items across entry kinds", () => {
    const eventEntry = buildEntry({ id: "event-1", kind: "event" });
    const reviewEntry = buildEntry({ id: "review-1", kind: "review" });
    const assessmentEntry = buildEntry({
      id: "assessment-1",
      kind: "assessment"
    });
    const assessment = assessmentTimelineMetadataSchema.parse({
      judgment: "Escalation risk remains limited.",
      confidenceLabel: "medium",
      probabilityPct: 35,
      assumptions: ["Diplomatic channels remain open"],
      indicators: ["Watch for evacuation orders"],
      resolutionCriteria: "Direct military action occurs.",
      targetResolvesAt: "2026-05-25T00:00:00.000Z",
      previousAssessmentEntryId: "assessment-0"
    });

    expect(
      listTopicTimelineResponseSchema.parse({
        items: [
          { kind: "event", entry: eventEntry },
          { kind: "review", entry: reviewEntry },
          {
            kind: "assessment",
            entry: assessmentEntry,
            assessment
          }
        ]
      })
    ).toEqual({
      items: [
        { kind: "event", entry: eventEntry },
        { kind: "review", entry: reviewEntry },
        { kind: "assessment", entry: assessmentEntry, assessment }
      ]
    });
  });

  it("requires timeline item kind to match the nested entry kind", () => {
    expect(() =>
      topicTimelineItemSchema.parse({
        kind: "event",
        entry: buildEntry({ id: "review-1", kind: "review" })
      })
    ).toThrow();
  });
});

function buildEntry(overrides: {
  id: string;
  kind: "event" | "assessment" | "review";
}) {
  return {
    id: overrides.id,
    topicId: "topic-1",
    kind: overrides.kind,
    epistemicStatus: overrides.kind === "assessment" ? "forecast" : "reported",
    title: "Timeline entry",
    bodyMd: "Timeline entry body.",
    sortAt: "2026-04-25T00:00:00.000Z",
    isApproximateDate: false,
    originType: "manual",
    status: "active",
    createdAt: "2026-04-25T01:00:00.000Z",
    updatedAt: "2026-04-25T01:00:00.000Z"
  };
}
