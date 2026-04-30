import { describe, expect, it } from "vitest";

import {
  assessmentConfidenceLabelSchema,
  createEventEntryRequestSchema,
  createTopicRequestSchema,
  isSignalTrackerRetryableDbErrorCode,
  signalTrackerApiErrorCodes,
  signalTrackerRoutes
} from "./index.js";

describe("signal-tracker-shared public barrel", () => {
  it("re-exports focused contract modules through the package root", () => {
    expect(signalTrackerRoutes.createTopic.path).toBe("/create-topic");
    expect(signalTrackerApiErrorCodes.persistenceUnavailable).toBe(
      "PERSISTENCE_UNAVAILABLE"
    );
    expect(
      isSignalTrackerRetryableDbErrorCode(
        signalTrackerApiErrorCodes.persistenceUnavailable
      )
    ).toBe(true);
    expect(assessmentConfidenceLabelSchema.options).toEqual([
      "low",
      "medium",
      "high"
    ]);
    expect(
      createTopicRequestSchema.parse({
        title: " Topic ",
        framingQuestion: " What changed? "
      })
    ).toMatchObject({
      title: "Topic",
      framingQuestion: "What changed?"
    });
    expect(
      createEventEntryRequestSchema.parse({
        topicId: " topic-1 ",
        title: " Event ",
        bodyMd: " Body ",
        sortAt: " 2026-04-25T00:00:00.000Z ",
        epistemicStatus: "reported"
      })
    ).toMatchObject({
      topicId: "topic-1",
      title: "Event",
      bodyMd: "Body"
    });
  });
});
