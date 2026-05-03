// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SignalTrackerRouteRequest } from "@repo/signal-tracker-shared";

import { loadRuntimeConfig } from "../../config";
import { makeStore } from "../../store";
import {
  apiBaseUrl,
  citationRecord,
  createJsonResponse,
  eventEntry,
  evidenceAnchor,
  evidenceItem,
  expectRouteRequest,
  stubRouteResponse
} from "../apiTestData";
import { citationApi } from "./citationApi";

vi.mock("../../config", () => ({
  loadRuntimeConfig: vi.fn()
}));

const loadRuntimeConfigMock = vi.mocked(loadRuntimeConfig);

describe("citationApi", () => {
  beforeEach(() => {
    loadRuntimeConfigMock.mockResolvedValue({ apiBaseUrl });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("attaches entry citations through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("attachEntryCitation", {
      citation: citationRecord
    });
    const request = {
      entryId: eventEntry.id,
      evidenceItemId: evidenceItem.id,
      evidenceAnchorId: evidenceAnchor.id,
      relationType: "supports" as const,
      note: undefined
    } satisfies SignalTrackerRouteRequest<"attachEntryCitation">;

    const result = await makeStore()
      .dispatch(citationApi.endpoints.attachEntryCitation.initiate(request))
      .unwrap();

    expect(result.citation).toEqual(citationRecord);
    await expectRouteRequest(fetchMock, "attachEntryCitation", request);
  });

  it("detaches entry citations through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("detachEntryCitation", {
      citation: citationRecord
    });
    const request = {
      entryId: eventEntry.id,
      citationId: citationRecord.citation.id
    } satisfies SignalTrackerRouteRequest<"detachEntryCitation">;

    const result = await makeStore()
      .dispatch(citationApi.endpoints.detachEntryCitation.initiate(request))
      .unwrap();

    expect(result.citation).toEqual(citationRecord);
    await expectRouteRequest(fetchMock, "detachEntryCitation", request);
  });

  it("lists entry citations through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("listEntryCitations", {
      citations: [citationRecord]
    });
    const request = {
      entryId: eventEntry.id
    } satisfies SignalTrackerRouteRequest<"listEntryCitations">;

    const result = await makeStore()
      .dispatch(citationApi.endpoints.listEntryCitations.initiate(request))
      .unwrap();

    expect(result.citations).toEqual([citationRecord]);
    await expectRouteRequest(fetchMock, "listEntryCitations", request);
  });

  it("rejects citation responses that do not match the shared schema", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    stubFetch({
      citations: [
        {
          ...citationRecord,
          citation: {
            ...citationRecord.citation,
            relationType: "bad"
          }
        }
      ]
    });

    try {
      await expect(
        makeStore()
          .dispatch(
            citationApi.endpoints.listEntryCitations.initiate({
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
