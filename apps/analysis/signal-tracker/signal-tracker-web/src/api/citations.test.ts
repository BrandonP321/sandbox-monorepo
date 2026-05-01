import { describe, expect, it, vi } from "vitest";

import { postSignalTrackerDbBackedApi } from "./db-backed-request";
import {
  attachEntryCitation,
  detachEntryCitation,
  listEntryCitations
} from "./citations";

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

describe("citation API wrappers", () => {
  it("attaches entry citations through the DB-backed API path", async () => {
    const request = {
      entryId: "entry-1",
      evidenceItemId: "evidence-1",
      relationType: "supports" as const,
      note: undefined
    };
    const options = { wakeUpDelayMs: 25 };

    await attachEntryCitation(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "attachEntryCitation",
      request,
      options
    );
  });

  it("detaches entry citations through the DB-backed API path", async () => {
    const request = {
      entryId: "entry-1",
      citationId: "citation-1"
    };
    const options = { requestTimeoutMs: 50 };

    await detachEntryCitation(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "detachEntryCitation",
      request,
      options
    );
  });

  it("lists entry citations through the DB-backed API path", async () => {
    const request = { entryId: "entry-1" };
    const options = { requestTimeoutMs: 50 };

    await listEntryCitations(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "listEntryCitations",
      request,
      options
    );
  });
});
