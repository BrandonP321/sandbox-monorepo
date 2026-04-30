import { describe, expect, it, vi } from "vitest";

import {
  createEventEntryResponseSchema,
  listEventEntriesResponseSchema,
  signalTrackerRoutes
} from "@repo/signal-tracker-shared";

import { postSignalTrackerDbBackedApi } from "./db-backed-request";
import { createEventEntry, listEventEntries } from "./event-entries";

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

describe("event entry API wrappers", () => {
  it("creates event entries through the DB-backed API path", async () => {
    const request = {
      topicId: "topic-1",
      title: "Court grants injunction",
      bodyMd: "A federal court granted an injunction.",
      sortAt: "2026-04-25T00:00:00.000Z",
      epistemicStatus: "reported" as const
    };
    const options = { wakeUpDelayMs: 25 };

    await createEventEntry(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      {
        route: signalTrackerRoutes.createEventEntry,
        body: request,
        responseSchema: createEventEntryResponseSchema
      },
      options
    );
  });

  it("lists event entries through the DB-backed API path", async () => {
    const request = { topicId: "topic-1" };
    const options = { requestTimeoutMs: 50 };

    await listEventEntries(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      {
        route: signalTrackerRoutes.listEventEntries,
        body: request,
        responseSchema: listEventEntriesResponseSchema
      },
      options
    );
  });
});
