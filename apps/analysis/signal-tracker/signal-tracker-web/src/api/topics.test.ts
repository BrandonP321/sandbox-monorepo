import { describe, expect, it, vi } from "vitest";

import {
  createTopicResponseSchema,
  getTopicResponseSchema,
  listTopicsResponseSchema,
  signalTrackerRoutes
} from "@repo/signal-tracker-shared";

import { postSignalTrackerDbBackedApi } from "./db-backed-request";
import { createTopic, getTopic, listTopics } from "./topics";

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
      {
        route: signalTrackerRoutes.createTopic,
        body: request,
        responseSchema: createTopicResponseSchema
      },
      options
    );
  });

  it("reads topics through the DB-backed API path", async () => {
    const request = { topicId: "topic-1" };

    await getTopic(request);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      {
        route: signalTrackerRoutes.getTopic,
        body: request,
        responseSchema: getTopicResponseSchema
      },
      undefined
    );
  });

  it("lists topics through the DB-backed API path", async () => {
    const request = { query: undefined };
    const options = { requestTimeoutMs: 50 };

    await listTopics(request, options);

    expect(postSignalTrackerDbBackedApiMock).toHaveBeenCalledWith(
      {
        route: signalTrackerRoutes.listTopics,
        body: request,
        responseSchema: listTopicsResponseSchema
      },
      options
    );
  });
});
