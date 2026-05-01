import { describe, expect, it, vi } from "vitest";

import { postSignalTrackerDbBackedApi } from "./db-backed-request";
import { createReviewNote, listReviewNotes } from "./review-notes";

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

describe("review note API wrappers", () => {
  it("creates review notes through the DB-backed API path", async () => {
    const request = {
      topicId: "topic-1",
      title: "Weekly review",
      bodyMd: "Reviewed recent developments and found no material change.",
      sortAt: "2026-04-25T00:00:00.000Z",
      epistemicStatus: "inferred" as const
    };
    const options = { wakeUpDelayMs: 25 };

    await createReviewNote(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "createReviewNote",
      request,
      options
    );
  });

  it("lists review notes through the DB-backed API path", async () => {
    const request = { topicId: "topic-1" };
    const options = { requestTimeoutMs: 50 };

    await listReviewNotes(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "listReviewNotes",
      request,
      options
    );
  });
});
