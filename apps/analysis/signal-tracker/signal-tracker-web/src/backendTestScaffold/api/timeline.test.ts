import { describe, expect, it, vi } from "vitest";

import { postSignalTrackerDbBackedApi } from "./db-backed-request";
import { listTopicTimeline } from "./timeline";

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

describe("topic timeline API wrappers", () => {
  it("lists topic timeline items through the DB-backed API path", async () => {
    const request = { topicId: "topic-1", limit: 6 };
    const options = { wakeUpDelayMs: 25 };

    await listTopicTimeline(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "listTopicTimeline",
      request,
      options
    );
  });
});
