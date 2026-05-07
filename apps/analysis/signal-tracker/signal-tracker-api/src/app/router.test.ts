import { describe, expect, it, vi } from "vitest";

import { signalTrackerRoutes } from "@repo/signal-tracker-shared";

import { InMemoryAssessmentRepository } from "../domain/assessments/assessment-repository";
import { InMemoryEntryCitationRepository } from "../domain/citations/entry-citation-repository";
import { InMemoryEntryRepository } from "../domain/entries/entry-repository";
import { InMemoryEntrySourceSummaryRepository } from "../domain/entries/entry-source-summary-repository";
import { InMemoryEvidenceAnchorRepository } from "../domain/evidence/evidence-anchor-repository";
import { InMemoryEvidenceRepository } from "../domain/evidence/evidence-repository";
import { InMemoryTopicRepository } from "../domain/topics/topic-repository";
import { createAppRouter } from "./router";

describe("createAppRouter", () => {
  it("shares injected dependencies across route handlers", async () => {
    const router = createAppRouter({
      topicRepository: new InMemoryTopicRepository(),
      entryRepository: new InMemoryEntryRepository(),
      entrySourceSummaryRepository: new InMemoryEntrySourceSummaryRepository(),
      assessmentRepository: new InMemoryAssessmentRepository(),
      entryCitationRepository: new InMemoryEntryCitationRepository(),
      evidenceRepository: new InMemoryEvidenceRepository(),
      evidenceAnchorRepository: new InMemoryEvidenceAnchorRepository(),
      createId: () => "topic-1",
      now: () => new Date("2026-04-25T00:00:00.000Z")
    });

    const createResult = await router({
      method: signalTrackerRoutes.createTopic.method,
      path: signalTrackerRoutes.createTopic.path,
      body: JSON.stringify({
        title: "Iran strike risk",
        framingQuestion: "Will tensions escalate?"
      })
    });

    expect(createResult.statusCode).toBe(200);

    const getResult = await router({
      method: signalTrackerRoutes.getTopic.method,
      path: signalTrackerRoutes.getTopic.path,
      body: JSON.stringify({ topicId: "topic-1" })
    });

    expect(getResult.statusCode).toBe(200);
    expect(JSON.parse(getResult.body)).toEqual({
      topic: {
        id: "topic-1",
        title: "Iran strike risk",
        framingQuestion: "Will tensions escalate?",
        status: "active",
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z",
        reviewCadence: "ad_hoc"
      },
      currentAssessment: null
    });
  });

  it("shares injected evidence dependencies across route handlers", async () => {
    const evidenceRepository = new InMemoryEvidenceRepository();
    const evidenceAnchorRepository = new InMemoryEvidenceAnchorRepository();
    const router = createAppRouter({
      topicRepository: new InMemoryTopicRepository(),
      entryRepository: new InMemoryEntryRepository(),
      entrySourceSummaryRepository: new InMemoryEntrySourceSummaryRepository(),
      assessmentRepository: new InMemoryAssessmentRepository(),
      entryCitationRepository: new InMemoryEntryCitationRepository(),
      evidenceRepository,
      evidenceAnchorRepository,
      generateId: vi
        .fn(() => "source-1")
        .mockReturnValueOnce("source-1")
        .mockReturnValueOnce("evidence-1")
        .mockReturnValueOnce("anchor-1"),
      now: () => new Date("2026-04-25T00:00:00.000Z")
    });

    const createResult = await router({
      method: signalTrackerRoutes.captureEvidenceUrl.method,
      path: signalTrackerRoutes.captureEvidenceUrl.path,
      body: JSON.stringify({
        url: "https://www.reuters.com/world/example",
        title: "Court grants injunction"
      })
    });

    expect(createResult.statusCode).toBe(200);

    const getResult = await router({
      method: signalTrackerRoutes.getEvidenceItem.method,
      path: signalTrackerRoutes.getEvidenceItem.path,
      body: JSON.stringify({ evidenceItemId: "evidence-1" })
    });

    expect(getResult.statusCode).toBe(200);
    expect(JSON.parse(getResult.body)).toEqual(JSON.parse(createResult.body));

    const createAnchorResult = await router({
      method: signalTrackerRoutes.createEvidenceAnchor.method,
      path: signalTrackerRoutes.createEvidenceAnchor.path,
      body: JSON.stringify({
        evidenceItemId: "evidence-1",
        quoteText: "A federal court granted an injunction."
      })
    });

    expect(createAnchorResult.statusCode).toBe(200);

    const listAnchorsResult = await router({
      method: signalTrackerRoutes.listEvidenceAnchorsForItem.method,
      path: signalTrackerRoutes.listEvidenceAnchorsForItem.path,
      body: JSON.stringify({ evidenceItemId: "evidence-1" })
    });

    expect(listAnchorsResult.statusCode).toBe(200);
    expect(JSON.parse(listAnchorsResult.body)).toEqual({
      anchors: [JSON.parse(createAnchorResult.body).anchor]
    });
  });

  it("shares injected entry dependencies across review note route handlers", async () => {
    const assessmentRepository = new InMemoryAssessmentRepository();
    const findLatestActiveByTopic = vi.spyOn(
      assessmentRepository,
      "findLatestActiveByTopic"
    );
    const router = createAppRouter({
      topicRepository: new InMemoryTopicRepository(),
      entryRepository: new InMemoryEntryRepository(),
      entrySourceSummaryRepository: new InMemoryEntrySourceSummaryRepository(),
      assessmentRepository,
      entryCitationRepository: new InMemoryEntryCitationRepository(),
      evidenceRepository: new InMemoryEvidenceRepository(),
      evidenceAnchorRepository: new InMemoryEvidenceAnchorRepository(),
      createId: () => "topic-1",
      generateId: () => "review-1",
      now: () => new Date("2026-04-25T00:00:00.000Z")
    });

    await router({
      method: signalTrackerRoutes.createTopic.method,
      path: signalTrackerRoutes.createTopic.path,
      body: JSON.stringify({
        title: "Iran strike risk",
        framingQuestion: "Will tensions escalate?"
      })
    });

    const createResult = await router({
      method: signalTrackerRoutes.createReviewNote.method,
      path: signalTrackerRoutes.createReviewNote.path,
      body: JSON.stringify({
        topicId: "topic-1",
        title: "Weekly review",
        bodyMd: "No major developments since the prior review.",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "observed"
      })
    });

    expect(createResult.statusCode).toBe(200);

    const getResult = await router({
      method: signalTrackerRoutes.getReviewNote.method,
      path: signalTrackerRoutes.getReviewNote.path,
      body: JSON.stringify({ entryId: "review-1" })
    });

    expect(getResult.statusCode).toBe(200);
    expect(JSON.parse(getResult.body)).toEqual({
      entry: withHydratedSources(JSON.parse(createResult.body).entry)
    });

    const listResult = await router({
      method: signalTrackerRoutes.listReviewNotes.method,
      path: signalTrackerRoutes.listReviewNotes.path,
      body: JSON.stringify({ topicId: "topic-1" })
    });

    expect(listResult.statusCode).toBe(200);
    expect(JSON.parse(listResult.body)).toEqual({
      entries: [withHydratedSources(JSON.parse(createResult.body).entry)]
    });
    expect(findLatestActiveByTopic).not.toHaveBeenCalled();
  });

  it("shares injected dependencies with the topic timeline route", async () => {
    const router = createAppRouter({
      topicRepository: new InMemoryTopicRepository(),
      entryRepository: new InMemoryEntryRepository(),
      entrySourceSummaryRepository: new InMemoryEntrySourceSummaryRepository(),
      assessmentRepository: new InMemoryAssessmentRepository(),
      entryCitationRepository: new InMemoryEntryCitationRepository(),
      evidenceRepository: new InMemoryEvidenceRepository(),
      evidenceAnchorRepository: new InMemoryEvidenceAnchorRepository(),
      createId: () => "topic-1",
      generateId: vi
        .fn(() => "event-1")
        .mockReturnValueOnce("event-1")
        .mockReturnValueOnce("assessment-1"),
      now: () => new Date("2026-04-25T01:00:00.000Z")
    });

    await router({
      method: signalTrackerRoutes.createTopic.method,
      path: signalTrackerRoutes.createTopic.path,
      body: JSON.stringify({
        title: "Iran strike risk",
        framingQuestion: "Will tensions escalate?"
      })
    });
    const eventResult = await router({
      method: signalTrackerRoutes.createEventEntry.method,
      path: signalTrackerRoutes.createEventEntry.path,
      body: JSON.stringify({
        topicId: "topic-1",
        title: "Court grants injunction",
        bodyMd: "A federal court granted an injunction.",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "reported"
      })
    });
    const assessmentResult = await router({
      method: signalTrackerRoutes.createAssessmentUpdate.method,
      path: signalTrackerRoutes.createAssessmentUpdate.path,
      body: JSON.stringify({
        topicId: "topic-1",
        judgment: "Escalation risk remains limited.",
        confidenceLabel: "medium",
        assumptions: ["Diplomatic channels remain open"],
        indicators: ["Watch for evacuation orders"],
        sortAt: "2026-04-26T00:00:00.000Z"
      })
    });

    const timelineResult = await router({
      method: signalTrackerRoutes.listTopicTimeline.method,
      path: signalTrackerRoutes.listTopicTimeline.path,
      body: JSON.stringify({ topicId: "topic-1" })
    });

    expect(timelineResult.statusCode).toBe(200);
    expect(JSON.parse(timelineResult.body)).toEqual({
      items: [
        {
          kind: "assessment",
          entry: withHydratedSources(
            JSON.parse(assessmentResult.body).assessmentUpdate.entry
          ),
          assessment: {
            judgment: "Escalation risk remains limited.",
            confidenceLabel: "medium",
            assumptions: ["Diplomatic channels remain open"],
            indicators: ["Watch for evacuation orders"]
          }
        },
        {
          kind: "event",
          entry: withHydratedSources(JSON.parse(eventResult.body).entry)
        }
      ]
    });
  });
});

function withHydratedSources<T extends object>(entry: T) {
  return { ...entry, sources: [] };
}
