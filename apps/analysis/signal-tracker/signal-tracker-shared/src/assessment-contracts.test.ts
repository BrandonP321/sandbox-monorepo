import { describe, expect, it } from "vitest";

import {
  assessmentConfidenceLabelSchema,
  assessmentUpdateSchema,
  createAssessmentUpdateRequestSchema,
  createAssessmentUpdateResponseSchema
} from "./assessment-contracts.js";
import { entrySchema } from "./entry-contracts.js";

describe("assessment contracts", () => {
  it("validates assessment taxonomy values", () => {
    expect(assessmentConfidenceLabelSchema.options).toEqual([
      "low",
      "medium",
      "high"
    ]);
  });

  it("validates assessment update creation requests", () => {
    expect(
      createAssessmentUpdateRequestSchema.parse({
        topicId: " topic-1 ",
        title: " Initial assessment ",
        judgment: " Escalation risk remains limited. ",
        confidenceLabel: "medium",
        probabilityPct: 35,
        assumptions: [
          " Diplomatic channels remain open ",
          " No direct strike "
        ],
        indicators: [" Carrier movement ", " Evacuation orders "],
        resolutionCriteria: " Direct military action occurs. ",
        targetResolvesAt: " 2026-05-25T00:00:00.000Z ",
        sortAt: " 2026-04-25T00:00:00.000Z ",
        sources: [{ url: " https://www.reuters.com/world/example " }]
      })
    ).toEqual({
      topicId: "topic-1",
      title: "Initial assessment",
      judgment: "Escalation risk remains limited.",
      confidenceLabel: "medium",
      probabilityPct: 35,
      assumptions: ["Diplomatic channels remain open", "No direct strike"],
      indicators: ["Carrier movement", "Evacuation orders"],
      resolutionCriteria: "Direct military action occurs.",
      targetResolvesAt: "2026-05-25T00:00:00.000Z",
      sortAt: "2026-04-25T00:00:00.000Z",
      sources: [{ url: "https://www.reuters.com/world/example" }]
    });

    expect(
      createAssessmentUpdateRequestSchema.parse({
        topicId: "topic-1",
        title: " ",
        judgment: "Escalation risk remains limited.",
        confidenceLabel: "low",
        assumptions: ["No direct strike"],
        indicators: ["Evacuation orders"],
        sortAt: "2026-04-25T00:00:00.000Z"
      }).title
    ).toBeUndefined();
  });

  it("rejects invalid assessment update requests", () => {
    const baseRequest = {
      topicId: "topic-1",
      judgment: "Escalation risk remains limited.",
      confidenceLabel: "medium",
      assumptions: ["No direct strike"],
      indicators: ["Evacuation orders"],
      sortAt: "2026-04-25T00:00:00.000Z"
    };

    expect(() =>
      createAssessmentUpdateRequestSchema.parse({
        ...baseRequest,
        judgment: " "
      })
    ).toThrow();
    expect(() =>
      createAssessmentUpdateRequestSchema.parse({
        ...baseRequest,
        confidenceLabel: "certain"
      })
    ).toThrow();
    expect(() =>
      createAssessmentUpdateRequestSchema.parse({
        ...baseRequest,
        probabilityPct: -1
      })
    ).toThrow();
    expect(() =>
      createAssessmentUpdateRequestSchema.parse({
        ...baseRequest,
        probabilityPct: 101
      })
    ).toThrow();
    expect(() =>
      createAssessmentUpdateRequestSchema.parse({
        ...baseRequest,
        probabilityPct: 35.5
      })
    ).toThrow();
    expect(() =>
      createAssessmentUpdateRequestSchema.parse({
        ...baseRequest,
        assumptions: []
      })
    ).toThrow();
    expect(() =>
      createAssessmentUpdateRequestSchema.parse({
        ...baseRequest,
        indicators: [" "]
      })
    ).toThrow();
    expect(() =>
      createAssessmentUpdateRequestSchema.parse({
        ...baseRequest,
        sources: [{ url: "ftp://example.com/file" }]
      })
    ).toThrow();
  });

  it("validates assessment update response shapes", () => {
    const entry = entrySchema.parse({
      id: "entry-1",
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
    });
    const assessmentUpdate = assessmentUpdateSchema.parse({
      entry,
      judgment: "Escalation risk remains limited.",
      confidenceLabel: "medium",
      probabilityPct: 35,
      assumptions: ["No direct strike"],
      indicators: ["Evacuation orders"],
      resolutionCriteria: "Direct military action occurs.",
      targetResolvesAt: "2026-05-25T00:00:00.000Z",
      previousAssessmentEntryId: "entry-previous"
    });

    expect(
      createAssessmentUpdateResponseSchema.parse({ assessmentUpdate })
    ).toEqual({
      assessmentUpdate
    });
  });
});
