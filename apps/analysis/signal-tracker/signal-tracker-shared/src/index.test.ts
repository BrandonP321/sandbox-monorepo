import { describe, expect, it } from "vitest";

import {
  assessmentConfidenceLabelSchema,
  captureEvidenceUrlRequestSchema,
  createEventEntryRequestSchema,
  createEvidenceItemRequestSchema,
  createReviewNoteRequestSchema,
  listTopicTimelineRequestSchema,
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
    expect(signalTrackerRoutes.createEvidenceItem.path).toBe(
      "/create-evidence-item"
    );
    expect(signalTrackerRoutes.captureEvidenceUrl.path).toBe(
      "/capture-evidence-url"
    );
    expect(signalTrackerRoutes.createReviewNote.path).toBe(
      "/create-review-note"
    );
    expect(signalTrackerRoutes.listTopicTimeline.path).toBe(
      "/list-topic-timeline"
    );
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
    expect(
      createReviewNoteRequestSchema.parse({
        topicId: " topic-1 ",
        title: " Review ",
        bodyMd: " No major changes. ",
        sortAt: " 2026-04-25T00:00:00.000Z ",
        epistemicStatus: "observed"
      })
    ).toMatchObject({
      topicId: "topic-1",
      title: "Review",
      bodyMd: "No major changes."
    });
    expect(
      listTopicTimelineRequestSchema.parse({
        topicId: " topic-1 ",
        limit: 10
      })
    ).toEqual({
      topicId: "topic-1",
      limit: 10
    });
    expect(
      captureEvidenceUrlRequestSchema.parse({
        url: " https://www.reuters.com/world/example "
      })
    ).toEqual({
      url: "https://www.reuters.com/world/example"
    });
    expect(
      createEvidenceItemRequestSchema.parse({
        source: {
          canonicalName: " Reuters ",
          sourceType: "news"
        },
        title: " Evidence "
      })
    ).toMatchObject({
      source: {
        canonicalName: "Reuters",
        sourceType: "news"
      },
      title: "Evidence"
    });
  });
});
