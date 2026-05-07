import { describe, expect, it, vi } from "vitest";

import type {
  AssessmentUpdate,
  AttachedSourceSummary,
  Entry,
  TopicTimelineItem
} from "@repo/signal-tracker-shared";

import { InMemoryAssessmentRepository } from "../../domain/assessments/assessment-repository";
import { InMemoryEntryRepository } from "../../domain/entries/entry-repository";
import { InMemoryEntrySourceSummaryRepository } from "../../domain/entries/entry-source-summary-repository";
import { createListTopicTimelineHandler } from "./list-topic-timeline";

describe("list topic timeline route", () => {
  it("returns an empty timeline for topics without active entries", async () => {
    const handler = createListTopicTimelineHandler({
      entryRepository: new InMemoryEntryRepository(),
      assessmentRepository: new InMemoryAssessmentRepository(),
      entrySourceSummaryRepository: createSourceSummaryRepository()
    });

    const result = await handler({
      method: "POST",
      path: "/list-topic-timeline",
      body: JSON.stringify({ topicId: "missing-topic" })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ items: [] });
  });

  it("lists mixed timeline items in deterministic newest-first order", async () => {
    const { entryRepository, assessmentRepository } = createRepositories();
    const olderEvent = buildEntry({
      id: "event-older",
      kind: "event",
      sortAt: "2026-04-24T00:00:00.000Z",
      createdAt: "2026-04-24T01:00:00.000Z"
    });
    const newerReview = buildEntry({
      id: "review-newer",
      kind: "review",
      sortAt: "2026-04-26T00:00:00.000Z",
      createdAt: "2026-04-26T01:00:00.000Z"
    });
    const assessment = buildAssessmentUpdate({
      entry: {
        id: "assessment-middle",
        sortAt: "2026-04-25T00:00:00.000Z",
        createdAt: "2026-04-25T01:00:00.000Z"
      }
    });
    await entryRepository.create(olderEvent);
    await entryRepository.create(newerReview);
    await entryRepository.create({
      ...buildEntry({ id: "other-topic-event", kind: "event" }),
      topicId: "topic-2"
    });
    await entryRepository.create({
      ...buildEntry({ id: "archived-event", kind: "event" }),
      status: "archived",
      archivedAt: "2026-04-26T00:00:00.000Z"
    });
    await entryRepository.create({
      ...buildEntry({ id: "deleted-review", kind: "review" }),
      status: "deleted",
      deletedAt: "2026-04-26T00:00:00.000Z"
    });
    await entryRepository.create(
      buildEntry({ id: "entry-repo-assessment", kind: "assessment" })
    );
    await assessmentRepository.create(assessment);

    const handler = createListTopicTimelineHandler({
      entryRepository,
      assessmentRepository,
      entrySourceSummaryRepository: createSourceSummaryRepository({
        "event-older": [sourceSummaryFixture],
        "assessment-middle": [
          {
            ...sourceSummaryFixture,
            id: "citation-2",
            evidenceItemId: "evidence-2",
            relationType: "contextualizes"
          }
        ]
      })
    });
    const result = await handler({
      method: "POST",
      path: "/list-topic-timeline",
      body: JSON.stringify({ topicId: " topic-1 " })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      items: [
        { kind: "review", entry: { ...newerReview, sources: [] } },
        assessmentUpdateToTimelineItem(assessment, [
          {
            ...sourceSummaryFixture,
            id: "citation-2",
            evidenceItemId: "evidence-2",
            relationType: "contextualizes"
          }
        ]),
        {
          kind: "event",
          entry: { ...olderEvent, sources: [sourceSummaryFixture] }
        }
      ]
    });
  });

  it("breaks timestamp ties by created time and then entry ID", async () => {
    const { entryRepository, assessmentRepository } = createRepositories();
    const createdLater = buildEntry({
      id: "event-c",
      kind: "event",
      sortAt: "2026-04-25T00:00:00.000Z",
      createdAt: "2026-04-25T02:00:00.000Z"
    });
    const idFirst = buildEntry({
      id: "event-a",
      kind: "event",
      sortAt: "2026-04-25T00:00:00.000Z",
      createdAt: "2026-04-25T01:00:00.000Z"
    });
    const idSecond = buildEntry({
      id: "event-b",
      kind: "event",
      sortAt: "2026-04-25T00:00:00.000Z",
      createdAt: "2026-04-25T01:00:00.000Z"
    });
    await entryRepository.create(idSecond);
    await entryRepository.create(createdLater);
    await entryRepository.create(idFirst);

    const handler = createListTopicTimelineHandler({
      entryRepository,
      assessmentRepository,
      entrySourceSummaryRepository: createSourceSummaryRepository()
    });
    const result = await handler({
      method: "POST",
      path: "/list-topic-timeline",
      body: JSON.stringify({ topicId: "topic-1" })
    });

    expect(JSON.parse(result.body)).toEqual({
      items: [
        { kind: "event", entry: { ...createdLater, sources: [] } },
        { kind: "event", entry: { ...idFirst, sources: [] } },
        { kind: "event", entry: { ...idSecond, sources: [] } }
      ]
    });
  });

  it("applies the recent timeline limit after sorting", async () => {
    const { entryRepository, assessmentRepository } = createRepositories();
    await entryRepository.create(
      buildEntry({
        id: "event-older",
        kind: "event",
        sortAt: "2026-04-24T00:00:00.000Z"
      })
    );
    const newerEvent = buildEntry({
      id: "event-newer",
      kind: "event",
      sortAt: "2026-04-26T00:00:00.000Z"
    });
    await entryRepository.create(newerEvent);
    const handler = createListTopicTimelineHandler({
      entryRepository,
      assessmentRepository,
      entrySourceSummaryRepository: createSourceSummaryRepository({
        "event-newer": [sourceSummaryFixture]
      })
    });

    const result = await handler({
      method: "POST",
      path: "/list-topic-timeline",
      body: JSON.stringify({ topicId: "topic-1", limit: 1 })
    });

    expect(JSON.parse(result.body)).toEqual({
      items: [
        {
          kind: "event",
          entry: { ...newerEvent, sources: [sourceSummaryFixture] }
        }
      ]
    });
  });

  it("rejects invalid timeline requests", async () => {
    const handler = createListTopicTimelineHandler({
      entryRepository: new InMemoryEntryRepository(),
      assessmentRepository: new InMemoryAssessmentRepository(),
      entrySourceSummaryRepository: createSourceSummaryRepository()
    });

    for (const body of [
      {},
      { topicId: " " },
      { topicId: "topic-1", limit: 0 }
    ]) {
      await expect(
        handler({
          method: "POST",
          path: "/list-topic-timeline",
          body: JSON.stringify(body)
        })
      ).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
        statusCode: 400
      });
    }
  });

  it("returns persistence unavailable when timeline storage fails", async () => {
    const handler = createListTopicTimelineHandler({
      entryRepository: {
        listByTopic: vi.fn(async () => {
          throw new Error("database unavailable");
        })
      },
      assessmentRepository: {
        listActiveByTopic: vi.fn(async (): Promise<AssessmentUpdate[]> => [])
      },
      entrySourceSummaryRepository: createSourceSummaryRepository()
    });

    await expect(
      handler({
        method: "POST",
        path: "/list-topic-timeline",
        body: JSON.stringify({ topicId: "topic-1" })
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });
  });
});

function createRepositories() {
  return {
    entryRepository: new InMemoryEntryRepository(),
    assessmentRepository: new InMemoryAssessmentRepository()
  };
}

function buildEntry(
  overrides: Partial<Entry> & Pick<Entry, "id" | "kind">
): Entry {
  return {
    topicId: "topic-1",
    epistemicStatus: overrides.kind === "assessment" ? "forecast" : "reported",
    title: "Timeline entry",
    bodyMd: "Timeline entry body.",
    sortAt: "2026-04-25T00:00:00.000Z",
    isApproximateDate: false,
    originType: "manual",
    status: "active",
    createdAt: "2026-04-25T01:00:00.000Z",
    updatedAt: "2026-04-25T01:00:00.000Z",
    ...overrides
  };
}

function buildAssessmentUpdate(
  overrides: {
    entry?: Partial<Entry> & Pick<Entry, "id">;
  } = {}
): AssessmentUpdate {
  return {
    entry: buildEntry({
      id: overrides.entry?.id ?? "assessment-1",
      kind: "assessment",
      ...overrides.entry
    }),
    judgment: "Escalation risk remains limited.",
    confidenceLabel: "medium",
    probabilityPct: 35,
    assumptions: ["Diplomatic channels remain open"],
    indicators: ["Watch for evacuation orders"],
    resolutionCriteria: "Direct military action occurs.",
    targetResolvesAt: "2026-05-25T00:00:00.000Z",
    previousAssessmentEntryId: "assessment-0"
  };
}

function assessmentUpdateToTimelineItem(
  assessmentUpdate: AssessmentUpdate,
  sources: AttachedSourceSummary[] = []
): TopicTimelineItem {
  const { entry, ...assessment } = assessmentUpdate;

  return {
    kind: "assessment",
    entry: { ...entry, kind: "assessment", sources },
    assessment
  };
}

function createSourceSummaryRepository(
  summariesByEntryId: Record<string, AttachedSourceSummary[]> = {}
) {
  const repository = new InMemoryEntrySourceSummaryRepository();

  for (const [entryId, sources] of Object.entries(summariesByEntryId)) {
    repository.setSources(entryId, sources);
  }

  return repository;
}

const sourceSummaryFixture: AttachedSourceSummary = {
  id: "citation-1",
  evidenceItemId: "evidence-1",
  url: "https://www.reuters.com/world/example",
  canonicalUrl: "https://www.reuters.com/world/example",
  title: "Reuters report",
  sourceName: "Reuters",
  sourceDomain: "www.reuters.com",
  publishedAt: "2026-04-24T00:00:00.000Z",
  relationType: "source_for"
};
