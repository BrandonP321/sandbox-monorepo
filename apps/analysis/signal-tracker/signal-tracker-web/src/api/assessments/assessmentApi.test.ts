// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SignalTrackerRouteRequest } from "@repo/signal-tracker-shared";

import { loadRuntimeConfig } from "../../config";
import { makeStore } from "../../store";
import {
  apiBaseUrl,
  assessmentUpdate,
  createJsonResponse,
  expectRouteRequest,
  stubRouteResponse,
  topic
} from "../apiTestData";
import { assessmentApi } from "./assessmentApi";

vi.mock("../../config", () => ({
  loadRuntimeConfig: vi.fn()
}));

const loadRuntimeConfigMock = vi.mocked(loadRuntimeConfig);

describe("assessmentApi", () => {
  beforeEach(() => {
    loadRuntimeConfigMock.mockResolvedValue({ apiBaseUrl });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("creates assessment updates through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("createAssessmentUpdate", {
      assessmentUpdate
    });
    const request = {
      topicId: topic.id,
      title: undefined,
      judgment: "Risk is rising.",
      confidenceLabel: "medium" as const,
      probabilityPct: 55,
      assumptions: ["Negotiations remain stalled."],
      indicators: ["Official statements change."],
      resolutionCriteria: "Escalation is confirmed.",
      targetResolvesAt: "2026-06-01T00:00:00.000Z",
      sortAt: "2026-01-03T00:00:00.000Z"
    } satisfies SignalTrackerRouteRequest<"createAssessmentUpdate">;

    const result = await makeStore()
      .dispatch(
        assessmentApi.endpoints.createAssessmentUpdate.initiate(request)
      )
      .unwrap();

    expect(result.assessmentUpdate).toEqual(assessmentUpdate);
    await expectRouteRequest(fetchMock, "createAssessmentUpdate", request);
  });

  it("rejects assessment responses that do not match the shared schema", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    stubFetch({
      assessmentUpdate: { ...assessmentUpdate, probabilityPct: 101 }
    });

    try {
      await expect(
        makeStore()
          .dispatch(
            assessmentApi.endpoints.createAssessmentUpdate.initiate({
              topicId: topic.id,
              title: undefined,
              judgment: "Risk is rising.",
              confidenceLabel: "medium",
              assumptions: ["Negotiations remain stalled."],
              indicators: ["Official statements change."],
              resolutionCriteria: undefined,
              targetResolvesAt: undefined,
              sortAt: "2026-01-03T00:00:00.000Z"
            })
          )
          .unwrap()
      ).rejects.toThrow();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});

function stubFetch(body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(body));

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}
