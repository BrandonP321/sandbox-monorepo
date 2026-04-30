import { describe, expect, it, vi } from "vitest";

import { createAssessmentUpdate } from "./assessments";
import { postSignalTrackerDbBackedApi } from "./db-backed-request";

vi.mock("./db-backed-request", async () => {
  const actual = await vi.importActual<typeof import("./db-backed-request")>(
    "./db-backed-request"
  );

  return {
    ...actual,
    postSignalTrackerDbBackedApi: vi.fn()
  };
});

const postSignalTrackerDbBackedApiMock = vi.mocked(
  postSignalTrackerDbBackedApi
);

describe("assessment API wrappers", () => {
  it("creates assessment updates through the DB-backed API path", async () => {
    const request = {
      topicId: "topic-1",
      title: undefined,
      judgment: "Escalation risk remains limited.",
      confidenceLabel: "medium" as const,
      probabilityPct: 35,
      assumptions: ["Diplomatic channels remain open"],
      indicators: ["Watch for evacuation orders"],
      resolutionCriteria: "Direct military action occurs.",
      targetResolvesAt: "2026-05-25T00:00:00.000Z",
      sortAt: "2026-04-25T00:00:00.000Z"
    };
    const options = { wakeUpDelayMs: 25 };

    await createAssessmentUpdate(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "createAssessmentUpdate",
      request,
      options
    );
  });
});
