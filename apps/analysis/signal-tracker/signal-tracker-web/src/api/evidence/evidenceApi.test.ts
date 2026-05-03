// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SignalTrackerRouteRequest } from "@repo/signal-tracker-shared";

import { loadRuntimeConfig } from "../../config";
import { makeStore } from "../../store";
import {
  apiBaseUrl,
  createJsonResponse,
  evidenceAnchor,
  evidenceItem,
  evidenceRecord,
  expectRouteRequest,
  source,
  stubRouteResponse
} from "../apiTestData";
import { evidenceApi } from "./evidenceApi";

vi.mock("../../config", () => ({
  loadRuntimeConfig: vi.fn()
}));

const loadRuntimeConfigMock = vi.mocked(loadRuntimeConfig);

describe("evidenceApi", () => {
  beforeEach(() => {
    loadRuntimeConfigMock.mockResolvedValue({ apiBaseUrl });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("creates evidence items through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("createEvidenceItem", evidenceRecord);
    const request = {
      source: {
        canonicalName: source.canonicalName,
        sourceType: source.sourceType
      },
      canonicalUrl: evidenceItem.canonicalUrl,
      title: evidenceItem.title,
      metadata: {}
    } satisfies SignalTrackerRouteRequest<"createEvidenceItem">;

    const result = await makeStore()
      .dispatch(evidenceApi.endpoints.createEvidenceItem.initiate(request))
      .unwrap();

    expect(result).toEqual(evidenceRecord);
    await expectRouteRequest(fetchMock, "createEvidenceItem", request);
  });

  it("captures evidence URLs through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("captureEvidenceUrl", evidenceRecord);
    const request = {
      url: "https://agency.example/report",
      title: evidenceItem.title
    } satisfies SignalTrackerRouteRequest<"captureEvidenceUrl">;

    const result = await makeStore()
      .dispatch(evidenceApi.endpoints.captureEvidenceUrl.initiate(request))
      .unwrap();

    expect(result).toEqual(evidenceRecord);
    await expectRouteRequest(fetchMock, "captureEvidenceUrl", request);
  });

  it("gets evidence items through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("getEvidenceItem", evidenceRecord);
    const request = {
      evidenceItemId: evidenceItem.id
    } satisfies SignalTrackerRouteRequest<"getEvidenceItem">;

    const result = await makeStore()
      .dispatch(evidenceApi.endpoints.getEvidenceItem.initiate(request))
      .unwrap();

    expect(result).toEqual(evidenceRecord);
    await expectRouteRequest(fetchMock, "getEvidenceItem", request);
  });

  it("lists evidence items through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("listEvidenceItems", {
      evidence: [evidenceRecord]
    });
    const request = {
      query: undefined
    } satisfies SignalTrackerRouteRequest<"listEvidenceItems">;

    const result = await makeStore()
      .dispatch(evidenceApi.endpoints.listEvidenceItems.initiate())
      .unwrap();

    expect(result.evidence).toEqual([evidenceRecord]);
    await expectRouteRequest(fetchMock, "listEvidenceItems", request);
  });

  it("creates evidence anchors through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("createEvidenceAnchor", {
      anchor: evidenceAnchor
    });
    const request = {
      evidenceItemId: evidenceItem.id,
      quoteText: evidenceAnchor.quoteText,
      locator: {}
    } satisfies SignalTrackerRouteRequest<"createEvidenceAnchor">;

    const result = await makeStore()
      .dispatch(evidenceApi.endpoints.createEvidenceAnchor.initiate(request))
      .unwrap();

    expect(result.anchor).toEqual(evidenceAnchor);
    await expectRouteRequest(fetchMock, "createEvidenceAnchor", request);
  });

  it("gets evidence anchors through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("getEvidenceAnchor", {
      anchor: evidenceAnchor
    });
    const request = {
      anchorId: evidenceAnchor.id
    } satisfies SignalTrackerRouteRequest<"getEvidenceAnchor">;

    const result = await makeStore()
      .dispatch(evidenceApi.endpoints.getEvidenceAnchor.initiate(request))
      .unwrap();

    expect(result.anchor).toEqual(evidenceAnchor);
    await expectRouteRequest(fetchMock, "getEvidenceAnchor", request);
  });

  it("lists evidence anchors through the shared route contract", async () => {
    const fetchMock = stubRouteResponse("listEvidenceAnchorsForItem", {
      anchors: [evidenceAnchor]
    });
    const request = {
      evidenceItemId: evidenceItem.id
    } satisfies SignalTrackerRouteRequest<"listEvidenceAnchorsForItem">;

    const result = await makeStore()
      .dispatch(
        evidenceApi.endpoints.listEvidenceAnchorsForItem.initiate(request)
      )
      .unwrap();

    expect(result.anchors).toEqual([evidenceAnchor]);
    await expectRouteRequest(fetchMock, "listEvidenceAnchorsForItem", request);
  });

  it("rejects evidence responses that do not match the shared schema", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    stubFetch({
      evidence: [
        {
          ...evidenceRecord,
          evidenceItem: { ...evidenceItem, metadata: "bad" }
        }
      ]
    });

    try {
      await expect(
        makeStore()
          .dispatch(evidenceApi.endpoints.listEvidenceItems.initiate())
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
