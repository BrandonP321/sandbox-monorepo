import { describe, expect, it, vi } from "vitest";

import { postSignalTrackerDbBackedApi } from "./db-backed-request";
import {
  archiveTopic,
  createTopic,
  deleteTopic,
  getTopic,
  listTopics,
  updateTopic
} from "./topics";

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

describe("topic API wrappers", () => {
  it("creates topics through the DB-backed API path", async () => {
    const request = {
      title: "Iran strike risk",
      framingQuestion: "Will tensions escalate?",
      scopeNote: undefined,
      reviewCadence: "weekly" as const
    };
    const options = { wakeUpDelayMs: 25 };

    await createTopic(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "createTopic",
      request,
      options
    );
  });

  it("reads topics through the DB-backed API path", async () => {
    const request = { topicId: "topic-1" };

    await getTopic(request);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "getTopic",
      request,
      undefined
    );
  });

  it("lists topics through the DB-backed API path", async () => {
    const request = { query: undefined };
    const options = { requestTimeoutMs: 50 };

    await listTopics(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "listTopics",
      request,
      options
    );
  });

  it("updates topics through the DB-backed API path", async () => {
    const request = {
      topicId: "topic-1",
      title: "Updated topic",
      framingQuestion: "What changed?",
      scopeNote: null,
      reviewCadence: "monthly" as const
    };
    const options = { maxAttempts: 2 };

    await updateTopic(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "updateTopic",
      request,
      options
    );
  });

  it("archives topics through the DB-backed API path", async () => {
    const request = { topicId: "topic-1" };
    const options = { wakeUpDelayMs: 50 };

    await archiveTopic(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "archiveTopic",
      request,
      options
    );
  });

  it("deletes topics through the DB-backed API path", async () => {
    const request = { topicId: "topic-1" };

    await deleteTopic(request);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      "deleteTopic",
      request,
      undefined
    );
  });
});
