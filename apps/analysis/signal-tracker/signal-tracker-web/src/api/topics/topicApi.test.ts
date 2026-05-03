// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SignalTrackerRouteRequest } from "@repo/signal-tracker-shared";

import { loadRuntimeConfig } from "../../config";
import { makeStore } from "../../store";
import {
  apiBaseUrl,
  createJsonResponse,
  expectRouteRequest,
  stubRouteResponse,
  topic
} from "../apiTestData";
import { topicApi } from "./topicApi";

vi.mock("../../config", () => ({
  loadRuntimeConfig: vi.fn()
}));

const loadRuntimeConfigMock = vi.mocked(loadRuntimeConfig);

describe("topicApi", () => {
  beforeEach(() => {
    loadRuntimeConfigMock.mockResolvedValue({ apiBaseUrl });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("creates topics through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("createTopic", { topic });
    const request = {
      title: "New topic",
      framingQuestion: "What changed?",
      scopeNote: undefined,
      reviewCadence: "weekly"
    } satisfies SignalTrackerRouteRequest<"createTopic">;

    const result = await makeStore()
      .dispatch(topicApi.endpoints.createTopic.initiate(request))
      .unwrap();

    expect(result.topic).toEqual(topic);
    await expectRouteRequest(fetchMock, "createTopic", request);
  });

  it("gets topics through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("getTopic", {
      topic,
      currentAssessment: null
    });
    const request = {
      topicId: topic.id
    } satisfies SignalTrackerRouteRequest<"getTopic">;

    const result = await makeStore()
      .dispatch(topicApi.endpoints.getTopic.initiate(request))
      .unwrap();

    expect(result.topic).toEqual(topic);
    await expectRouteRequest(fetchMock, "getTopic", request);
  });

  it("lists topics through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("listTopics", { topics: [topic] });
    const request = {
      query: undefined
    } satisfies SignalTrackerRouteRequest<"listTopics">;

    const result = await makeStore()
      .dispatch(topicApi.endpoints.listTopics.initiate())
      .unwrap();

    expect(result.topics).toEqual([topic]);
    await expectRouteRequest(fetchMock, "listTopics", request);
  });

  it("updates topics through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("updateTopic", { topic });
    const request = {
      topicId: topic.id,
      title: "Updated topic",
      scopeNote: undefined
    } satisfies SignalTrackerRouteRequest<"updateTopic">;

    const result = await makeStore()
      .dispatch(topicApi.endpoints.updateTopic.initiate(request))
      .unwrap();

    expect(result.topic).toEqual(topic);
    await expectRouteRequest(fetchMock, "updateTopic", request);
  });

  it("archives topics through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("archiveTopic", { topic });
    const request = {
      topicId: topic.id
    } satisfies SignalTrackerRouteRequest<"archiveTopic">;

    const result = await makeStore()
      .dispatch(topicApi.endpoints.archiveTopic.initiate(request))
      .unwrap();

    expect(result.topic).toEqual(topic);
    await expectRouteRequest(fetchMock, "archiveTopic", request);
  });

  it("deletes topics through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("deleteTopic", { topic });
    const request = {
      topicId: topic.id
    } satisfies SignalTrackerRouteRequest<"deleteTopic">;

    const result = await makeStore()
      .dispatch(topicApi.endpoints.deleteTopic.initiate(request))
      .unwrap();

    expect(result.topic).toEqual(topic);
    await expectRouteRequest(fetchMock, "deleteTopic", request);
  });

  it("rejects topic responses that do not match the shared schema", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    stubFetch({ topic: { ...topic, title: "" } });

    try {
      await expect(
        makeStore()
          .dispatch(topicApi.endpoints.getTopic.initiate({ topicId: topic.id }))
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
