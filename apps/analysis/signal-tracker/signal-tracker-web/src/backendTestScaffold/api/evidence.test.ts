import { describe, expect, it, vi } from "vitest";

import { postSignalTrackerDbBackedApi } from "./db-backed-request";
import {
  captureEvidenceUrl,
  listEvidenceAnchorsForItem,
  listEvidenceItems
} from "./evidence";

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

describe("evidence API wrappers", () => {
  it("captures URL evidence through the DB-backed API path", async () => {
    const request = {
      url: "https://www.reuters.com/world/example"
    };
    const options = { wakeUpDelayMs: 25 };

    await captureEvidenceUrl(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "captureEvidenceUrl",
      request,
      options
    );
  });

  it("lists evidence items through the DB-backed API path", async () => {
    const request = { query: "reuters" };
    const options = { requestTimeoutMs: 50 };

    await listEvidenceItems(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "listEvidenceItems",
      request,
      options
    );
  });

  it("lists evidence anchors through the DB-backed API path", async () => {
    const request = { evidenceItemId: "evidence-1" };
    const options = { requestTimeoutMs: 50 };

    await listEvidenceAnchorsForItem(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "listEvidenceAnchorsForItem",
      request,
      options
    );
  });
});
