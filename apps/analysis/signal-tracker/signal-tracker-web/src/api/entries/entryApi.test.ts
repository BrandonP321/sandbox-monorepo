// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SignalTrackerRouteRequest } from "@repo/signal-tracker-shared";

import { loadRuntimeConfig } from "../../config";
import { makeStore } from "../../store";
import {
  apiBaseUrl,
  createJsonResponse,
  eventEntry,
  eventEntryReadModel,
  expectRouteRequest,
  stubRouteResponse,
  topic
} from "../apiTestData";
import { entryApi } from "./entryApi";

vi.mock("../../config", () => ({
  loadRuntimeConfig: vi.fn()
}));

const loadRuntimeConfigMock = vi.mocked(loadRuntimeConfig);

describe("entryApi", () => {
  beforeEach(() => {
    loadRuntimeConfigMock.mockResolvedValue({ apiBaseUrl });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("creates event entries through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("createEventEntry", {
      entry: eventEntry
    });
    const request = {
      topicId: topic.id,
      title: "Event 1",
      bodyMd: "A reported event.",
      sortAt: "2026-01-02T00:00:00.000Z",
      epistemicStatus: "reported"
    } satisfies SignalTrackerRouteRequest<"createEventEntry">;

    const result = await makeStore()
      .dispatch(entryApi.endpoints.createEventEntry.initiate(request))
      .unwrap();

    expect(result.entry).toEqual(eventEntry);
    await expectRouteRequest(fetchMock, "createEventEntry", request);
  });

  it("gets event entries through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("getEventEntry", {
      entry: eventEntryReadModel
    });
    const request = {
      entryId: eventEntry.id
    } satisfies SignalTrackerRouteRequest<"getEventEntry">;

    const result = await makeStore()
      .dispatch(entryApi.endpoints.getEventEntry.initiate(request))
      .unwrap();

    expect(result.entry).toEqual(eventEntryReadModel);
    await expectRouteRequest(fetchMock, "getEventEntry", request);
  });

  it("lists event entries through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("listEventEntries", {
      entries: [eventEntryReadModel]
    });
    const request = {
      topicId: topic.id
    } satisfies SignalTrackerRouteRequest<"listEventEntries">;

    const result = await makeStore()
      .dispatch(entryApi.endpoints.listEventEntries.initiate(request))
      .unwrap();

    expect(result.entries).toEqual([eventEntryReadModel]);
    await expectRouteRequest(fetchMock, "listEventEntries", request);
  });

  it("updates event entries through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("updateEventEntry", {
      entry: eventEntry
    });
    const request = {
      entryId: eventEntry.id,
      title: "Updated event"
    } satisfies SignalTrackerRouteRequest<"updateEventEntry">;

    const result = await makeStore()
      .dispatch(entryApi.endpoints.updateEventEntry.initiate(request))
      .unwrap();

    expect(result.entry).toEqual(eventEntry);
    await expectRouteRequest(fetchMock, "updateEventEntry", request);
  });

  it("rejects entry responses that do not match the shared schema", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    stubFetch({ entry: { ...eventEntry, title: "" } });

    try {
      await expect(
        makeStore()
          .dispatch(
            entryApi.endpoints.getEventEntry.initiate({
              entryId: eventEntry.id
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
