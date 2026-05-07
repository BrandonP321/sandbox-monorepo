// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  SignalTrackerRouteRequest,
  SignalTrackerRouteResponse
} from "@repo/signal-tracker-shared";

import { loadRuntimeConfig } from "../../config";
import { makeStore } from "../../store";
import {
  apiBaseUrl,
  assessmentUpdateReadModel,
  createJsonResponse,
  eventEntryReadModel,
  expectRouteRequest,
  stubRouteResponse,
  topic
} from "../apiTestData";
import { timelineApi } from "./timelineApi";

vi.mock("../../config", () => ({
  loadRuntimeConfig: vi.fn()
}));

const loadRuntimeConfigMock = vi.mocked(loadRuntimeConfig);

describe("timelineApi", () => {
  beforeEach(() => {
    loadRuntimeConfigMock.mockResolvedValue({ apiBaseUrl });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("lists topic timeline items through the shared route contract", async () => {
    const response = {
      items: [
        { kind: "event" as const, entry: eventEntryReadModel },
        {
          kind: "assessment" as const,
          entry: assessmentUpdateReadModel.entry,
          assessment: {
            judgment: assessmentUpdateReadModel.judgment,
            confidenceLabel: assessmentUpdateReadModel.confidenceLabel,
            probabilityPct: assessmentUpdateReadModel.probabilityPct,
            assumptions: assessmentUpdateReadModel.assumptions,
            indicators: assessmentUpdateReadModel.indicators,
            resolutionCriteria: assessmentUpdateReadModel.resolutionCriteria,
            targetResolvesAt: assessmentUpdateReadModel.targetResolvesAt,
            previousAssessmentEntryId:
              assessmentUpdateReadModel.previousAssessmentEntryId
          }
        }
      ]
    } satisfies SignalTrackerRouteResponse<"listTopicTimeline">;
    const fetchMock = stubRouteResponse("listTopicTimeline", response);
    const request = {
      topicId: topic.id,
      limit: 25
    } satisfies SignalTrackerRouteRequest<"listTopicTimeline">;

    const result = await makeStore()
      .dispatch(timelineApi.endpoints.listTopicTimeline.initiate(request))
      .unwrap();

    expect(result).toEqual(response);
    await expectRouteRequest(fetchMock, "listTopicTimeline", request);
  });

  it("rejects timeline responses that do not match the shared schema", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    stubFetch({ items: [{ kind: "unknown", entry: eventEntryReadModel }] });

    try {
      await expect(
        makeStore()
          .dispatch(
            timelineApi.endpoints.listTopicTimeline.initiate({
              topicId: topic.id
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
