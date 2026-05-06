// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SignalTrackerRouteRequest } from "@repo/signal-tracker-shared";
import { signalTrackerRouteContracts } from "@repo/signal-tracker-shared";

import { loadRuntimeConfig } from "../../config";
import { makeStore } from "../../store";
import {
  apiBaseUrl,
  createJsonResponse,
  expectRouteRequest,
  stubRouteResponse,
  topic
} from "../apiTestData";
import { timelineApi } from "../timeline/timelineApi";
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

  it("does not refetch active topic data after a failed delete", async () => {
    const fetchMock = stubTopicDetailDeleteFailure();
    const store = makeStore();
    const topicSubscription = store.dispatch(
      topicApi.endpoints.getTopic.initiate({ topicId: topic.id })
    );
    const timelineSubscription = store.dispatch(
      timelineApi.endpoints.listTopicTimeline.initiate({ topicId: topic.id })
    );

    await Promise.all([
      topicSubscription.unwrap(),
      timelineSubscription.unwrap()
    ]);
    fetchMock.mockClear();

    try {
      await expect(
        store
          .dispatch(
            topicApi.endpoints.deleteTopic.initiate({ topicId: topic.id })
          )
          .unwrap()
      ).rejects.toMatchObject({ status: 503 });
      await new Promise((resolve) => setTimeout(resolve, 0));
    } finally {
      topicSubscription.unsubscribe();
      timelineSubscription.unsubscribe();
    }

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getFetchRequest(fetchMock).url).toBe(
      `${apiBaseUrl}${signalTrackerRouteContracts.deleteTopic.route.path}`
    );
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

function stubTopicDetailDeleteFailure() {
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init);

      if (
        request.url ===
        `${apiBaseUrl}${signalTrackerRouteContracts.getTopic.route.path}`
      ) {
        return createJsonResponse({ topic, currentAssessment: null });
      }

      if (
        request.url ===
        `${apiBaseUrl}${signalTrackerRouteContracts.listTopicTimeline.route.path}`
      ) {
        return createJsonResponse({ items: [] });
      }

      if (
        request.url ===
        `${apiBaseUrl}${signalTrackerRouteContracts.deleteTopic.route.path}`
      ) {
        return new Response(
          JSON.stringify({
            error: {
              code: "DATABASE_UNAVAILABLE",
              message: "Delete is temporarily unavailable."
            }
          }),
          {
            status: 503,
            headers: {
              "content-type": "application/json"
            }
          }
        );
      }

      throw new Error(`Unexpected API request: ${request.url}`);
    }
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

function getFetchRequest(fetchMock: ReturnType<typeof vi.fn>): Request {
  const [input, init] = fetchMock.mock.calls[0] ?? [];

  if (input instanceof Request) {
    return input;
  }

  return new Request(input as RequestInfo | URL, init as RequestInit);
}
