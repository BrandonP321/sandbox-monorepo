import { describe, expect, it } from "vitest";

import {
  signalTrackerRouteContractEntries,
  signalTrackerRouteContracts,
  signalTrackerHealthResponseSchema,
  signalTrackerRouteEntries,
  signalTrackerRouteList,
  signalTrackerRoutes
} from "./routes.js";

describe("signalTrackerRoutes", () => {
  it("defines the signal tracker API routes once for all consumers", () => {
    expect(signalTrackerRoutes.createTopic).toEqual({
      method: "POST",
      path: "/create-topic"
    });
    expect(signalTrackerRoutes.getTopic).toEqual({
      method: "POST",
      path: "/get-topic"
    });
    expect(signalTrackerRoutes.listTopics).toEqual({
      method: "POST",
      path: "/list-topics"
    });
    expect(signalTrackerRoutes.updateTopic).toEqual({
      method: "POST",
      path: "/update-topic"
    });
    expect(signalTrackerRoutes.archiveTopic).toEqual({
      method: "POST",
      path: "/archive-topic"
    });
    expect(signalTrackerRoutes.deleteTopic).toEqual({
      method: "POST",
      path: "/delete-topic"
    });
    expect(signalTrackerRoutes.createEventEntry).toEqual({
      method: "POST",
      path: "/create-event-entry"
    });
    expect(signalTrackerRoutes.createAssessmentUpdate).toEqual({
      method: "POST",
      path: "/create-assessment-update"
    });
    expect(signalTrackerRoutes.createReviewNote).toEqual({
      method: "POST",
      path: "/create-review-note"
    });
    expect(signalTrackerRoutes.getEventEntry).toEqual({
      method: "POST",
      path: "/get-event-entry"
    });
    expect(signalTrackerRoutes.listEventEntries).toEqual({
      method: "POST",
      path: "/list-event-entries"
    });
    expect(signalTrackerRoutes.updateEventEntry).toEqual({
      method: "POST",
      path: "/update-event-entry"
    });
    expect(signalTrackerRoutes.getReviewNote).toEqual({
      method: "POST",
      path: "/get-review-note"
    });
    expect(signalTrackerRoutes.listReviewNotes).toEqual({
      method: "POST",
      path: "/list-review-notes"
    });
    expect(signalTrackerRoutes.listTopicTimeline).toEqual({
      method: "POST",
      path: "/list-topic-timeline"
    });
    expect(signalTrackerRoutes.createEvidenceItem).toEqual({
      method: "POST",
      path: "/create-evidence-item"
    });
    expect(signalTrackerRoutes.getEvidenceItem).toEqual({
      method: "POST",
      path: "/get-evidence-item"
    });
    expect(signalTrackerRoutes.getHealth).toEqual({
      method: "POST",
      path: "/get-health"
    });
  });

  it("exposes stable list and entry helpers", () => {
    expect(
      signalTrackerRouteEntries.map(
        ([name]: (typeof signalTrackerRouteEntries)[number]) => name
      )
    ).toEqual([
      "createTopic",
      "getTopic",
      "listTopics",
      "updateTopic",
      "archiveTopic",
      "deleteTopic",
      "createEventEntry",
      "createAssessmentUpdate",
      "createReviewNote",
      "getEventEntry",
      "listEventEntries",
      "updateEventEntry",
      "getReviewNote",
      "listReviewNotes",
      "listTopicTimeline",
      "createEvidenceItem",
      "getEvidenceItem",
      "getHealth"
    ]);
    expect(signalTrackerRouteList).toEqual([
      signalTrackerRoutes.createTopic,
      signalTrackerRoutes.getTopic,
      signalTrackerRoutes.listTopics,
      signalTrackerRoutes.updateTopic,
      signalTrackerRoutes.archiveTopic,
      signalTrackerRoutes.deleteTopic,
      signalTrackerRoutes.createEventEntry,
      signalTrackerRoutes.createAssessmentUpdate,
      signalTrackerRoutes.createReviewNote,
      signalTrackerRoutes.getEventEntry,
      signalTrackerRoutes.listEventEntries,
      signalTrackerRoutes.updateEventEntry,
      signalTrackerRoutes.getReviewNote,
      signalTrackerRoutes.listReviewNotes,
      signalTrackerRoutes.listTopicTimeline,
      signalTrackerRoutes.createEvidenceItem,
      signalTrackerRoutes.getEvidenceItem,
      signalTrackerRoutes.getHealth
    ]);
  });

  it("binds every route to request and response schemas", () => {
    expect(signalTrackerRouteContractEntries.map(([name]) => name)).toEqual(
      signalTrackerRouteEntries.map(([name]) => name)
    );
    expect(signalTrackerRouteContracts.createTopic.route).toBe(
      signalTrackerRoutes.createTopic
    );
    expect(
      signalTrackerRouteContracts.createTopic.requestSchema.parse({
        title: " Iran strike risk ",
        framingQuestion: " Will tensions escalate? "
      })
    ).toEqual({
      title: "Iran strike risk",
      framingQuestion: "Will tensions escalate?",
      reviewCadence: "ad_hoc"
    });
    expect(
      signalTrackerRouteContracts.getHealth.requestSchema.parse({})
    ).toEqual({});
    expect(
      signalTrackerRouteContracts.listTopicTimeline.requestSchema.parse({
        topicId: " topic-1 ",
        limit: 10
      })
    ).toEqual({
      topicId: "topic-1",
      limit: 10
    });
    expect(
      signalTrackerRouteContracts.getHealth.responseSchema.parse({ ok: true })
    ).toEqual({ ok: true });
  });

  it("validates the health response payload", () => {
    const payload = signalTrackerHealthResponseSchema.parse({ ok: true });

    expect(payload.ok).toBe(true);
  });
});
