import { describe, expect, it } from "vitest";

import { createAssessmentUpdateRequest } from "./request";
import type { AssessmentUpdateFormValues } from "./schema";

const baseValues = {
  assessmentDate: "2026-04-25",
  assumptions: " Diplomatic channels remain open \n \n No direct strike ",
  confidenceLabel: "medium",
  indicators: " Watch for evacuation orders ",
  judgment: " Escalation risk remains limited. ",
  probabilityPct: undefined,
  resolutionCriteria: "",
  sources: [],
  targetResolutionDate: ""
} satisfies AssessmentUpdateFormValues;

describe("createAssessmentUpdateRequest", () => {
  it("trims and converts form fields into the shared request shape", () => {
    expect(
      createAssessmentUpdateRequest({
        topicId: "topic-1",
        values: {
          ...baseValues,
          probabilityPct: 35,
          resolutionCriteria: " Direct military action occurs. ",
          targetResolutionDate: "2026-05-25"
        }
      })
    ).toEqual({
      topicId: "topic-1",
      judgment: "Escalation risk remains limited.",
      confidenceLabel: "medium",
      probabilityPct: 35,
      assumptions: ["Diplomatic channels remain open", "No direct strike"],
      indicators: ["Watch for evacuation orders"],
      resolutionCriteria: "Direct military action occurs.",
      targetResolvesAt: "2026-05-25T00:00:00.000Z",
      sortAt: "2026-04-25T00:00:00.000Z"
    });
  });

  it("omits blank optional fields", () => {
    const request = createAssessmentUpdateRequest({
      topicId: "topic-1",
      values: baseValues
    });

    expect(request).toMatchObject({
      topicId: "topic-1",
      judgment: "Escalation risk remains limited.",
      confidenceLabel: "medium",
      assumptions: ["Diplomatic channels remain open", "No direct strike"],
      indicators: ["Watch for evacuation orders"],
      sortAt: "2026-04-25T00:00:00.000Z"
    });
    expect(request).not.toHaveProperty("probabilityPct");
    expect(request).not.toHaveProperty("resolutionCriteria");
    expect(request).not.toHaveProperty("targetResolvesAt");
    expect(request).not.toHaveProperty("title");
    expect(request).not.toHaveProperty("sources");
  });

  it("includes captured source URLs", () => {
    expect(
      createAssessmentUpdateRequest({
        topicId: "topic-1",
        values: {
          ...baseValues,
          sources: [
            { url: "https://agency.example/report" },
            { url: "https://www.reuters.com/world/example" }
          ]
        }
      })
    ).toMatchObject({
      sources: [
        { url: "https://agency.example/report" },
        { url: "https://www.reuters.com/world/example" }
      ]
    });
  });

  it("rejects invalid values through the shared schema", () => {
    expect(() =>
      createAssessmentUpdateRequest({
        topicId: "topic-1",
        values: { ...baseValues, probabilityPct: 101 }
      })
    ).toThrow();
  });
});
