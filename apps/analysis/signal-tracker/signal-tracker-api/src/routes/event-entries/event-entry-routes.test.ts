import { describe, expect, it, vi } from "vitest";

import type {
  AttachedSourceSummary,
  Entry,
  Topic
} from "@repo/signal-tracker-shared";

import { InMemoryEntryCitationRepository } from "../../domain/citations/entry-citation-repository";
import { InMemoryEntryRepository } from "../../domain/entries/entry-repository";
import { InMemoryEntrySourceSummaryRepository } from "../../domain/entries/entry-source-summary-repository";
import { InMemoryEvidenceRepository } from "../../domain/evidence/evidence-repository";
import { InMemoryTopicRepository } from "../../domain/topics/topic-repository";
import { buildEntryCitationFixture } from "../../domain/test-fixtures";
import { createCreateEventEntryHandler } from "./create-event-entry";
import { createGetEventEntryHandler } from "./get-event-entry";
import { createListEventEntriesHandler } from "./list-event-entries";
import { createUpdateEventEntryHandler } from "./update-event-entry";

describe("event entry routes", () => {
  it("creates an event entry for an existing topic", async () => {
    const { entryRepository, topicRepository } = await createRepositories();
    const handler = createCreateEventEntryHandler({
      entryRepository,
      topicRepository,
      generateId: () => "entry-1",
      now: () => new Date("2026-04-25T01:00:00.000Z")
    });

    const result = await handler({
      method: "POST",
      path: "/create-event-entry",
      body: JSON.stringify({
        topicId: " topic-1 ",
        title: " Court grants injunction ",
        bodyMd: " A federal court granted an injunction. ",
        sortAt: " 2026-04-25T00:00:00.000Z ",
        epistemicStatus: "reported"
      })
    });

    const expectedEntry: Entry = {
      id: "entry-1",
      topicId: "topic-1",
      kind: "event",
      epistemicStatus: "reported",
      title: "Court grants injunction",
      bodyMd: "A federal court granted an injunction.",
      sortAt: "2026-04-25T00:00:00.000Z",
      isApproximateDate: false,
      originType: "manual",
      status: "active",
      createdAt: "2026-04-25T01:00:00.000Z",
      updatedAt: "2026-04-25T01:00:00.000Z"
    };
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ entry: expectedEntry });
    await expect(entryRepository.findById("entry-1")).resolves.toEqual(
      expectedEntry
    );
  });

  it("creates an event entry with attached source URLs", async () => {
    const { entryRepository, topicRepository } = await createRepositories();
    const evidenceRepository = new InMemoryEvidenceRepository();
    const entryCitationRepository = new InMemoryEntryCitationRepository();
    const handler = createCreateEventEntryHandler({
      entryRepository,
      topicRepository,
      evidenceRepository,
      entryCitationRepository,
      generateId: vi
        .fn(() => "unused")
        .mockReturnValueOnce("entry-1")
        .mockReturnValueOnce("source-1")
        .mockReturnValueOnce("evidence-1")
        .mockReturnValueOnce("citation-1"),
      now: () => new Date("2026-04-25T01:00:00.000Z")
    });

    const result = await handler({
      method: "POST",
      path: "/create-event-entry",
      body: JSON.stringify({
        ...createEventRequestFixture,
        sources: [
          {
            url: "https://www.reuters.com/world/example?utm_source=newsletter"
          }
        ]
      })
    });

    expect(result.statusCode).toBe(200);
    await expect(
      entryCitationRepository.listByEntry("entry-1")
    ).resolves.toEqual([
      {
        id: "citation-1",
        entryId: "entry-1",
        evidenceItemId: "evidence-1",
        relationType: "source_for",
        createdAt: "2026-04-25T01:00:00.000Z"
      }
    ]);
    await expect(
      evidenceRepository.findById("evidence-1")
    ).resolves.toMatchObject({
      evidenceItem: {
        canonicalUrl: "https://www.reuters.com/world/example"
      }
    });
  });

  it("rejects invalid event entry creation requests", async () => {
    const { entryRepository, topicRepository } = await createRepositories();
    const handler = createCreateEventEntryHandler({
      entryRepository,
      topicRepository
    });

    for (const body of [
      {},
      {
        topicId: "topic-1",
        title: " ",
        bodyMd: "A federal court granted an injunction.",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "reported"
      },
      {
        topicId: "topic-1",
        title: "Court grants injunction",
        bodyMd: " ",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "reported"
      },
      {
        topicId: "topic-1",
        title: "Court grants injunction",
        bodyMd: "A federal court granted an injunction.",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "rumored"
      },
      {
        ...createEventRequestFixture,
        sources: [{ url: "ftp://example.com/file" }]
      }
    ]) {
      await expect(
        handler({
          method: "POST",
          path: "/create-event-entry",
          body: JSON.stringify(body)
        })
      ).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
        statusCode: 400
      });
    }

    await expect(
      handler({
        method: "POST",
        path: "/create-event-entry",
        body: "{"
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
  });

  it("returns not found when creating an event for a missing topic", async () => {
    const handler = createCreateEventEntryHandler({
      entryRepository: new InMemoryEntryRepository(),
      topicRepository: new InMemoryTopicRepository()
    });

    await expect(
      handler({
        method: "POST",
        path: "/create-event-entry",
        body: JSON.stringify(createEventRequestFixture)
      })
    ).rejects.toMatchObject({
      code: "TOPIC_NOT_FOUND",
      statusCode: 404
    });
  });

  it("returns persistence unavailable when event creation storage fails", async () => {
    const { topicRepository } = await createRepositories();
    const handler = createCreateEventEntryHandler({
      entryRepository: {
        create: vi.fn(async () => {
          throw new Error("database unavailable");
        }),
        findById: vi.fn(async (): Promise<Entry | undefined> => undefined),
        listByTopic: vi.fn(async (): Promise<Entry[]> => []),
        update: vi.fn(async (): Promise<Entry | undefined> => undefined)
      },
      topicRepository
    });

    await expect(
      handler({
        method: "POST",
        path: "/create-event-entry",
        body: JSON.stringify(createEventRequestFixture)
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });
  });

  it("reads an event entry by ID", async () => {
    const entryRepository = new InMemoryEntryRepository();
    await entryRepository.create(eventEntryFixture);
    const handler = createGetEventEntryHandler({
      entryRepository,
      entrySourceSummaryRepository: createSourceSummaryRepository()
    });

    const result = await handler({
      method: "POST",
      path: "/get-event-entry",
      body: JSON.stringify({ entryId: " entry-1 " })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      entry: { ...eventEntryFixture, sources: [] }
    });
  });

  it("hydrates event entry source summaries on read", async () => {
    const entryRepository = new InMemoryEntryRepository();
    await entryRepository.create(eventEntryFixture);
    const sourceSummary = buildSourceSummaryFixture();
    const handler = createGetEventEntryHandler({
      entryRepository,
      entrySourceSummaryRepository: createSourceSummaryRepository({
        "entry-1": [sourceSummary]
      })
    });

    const result = await handler({
      method: "POST",
      path: "/get-event-entry",
      body: JSON.stringify({ entryId: "entry-1" })
    });

    expect(JSON.parse(result.body)).toEqual({
      entry: { ...eventEntryFixture, sources: [sourceSummary] }
    });
  });

  it("rejects missing and non-event entries on event reads", async () => {
    const entryRepository = new InMemoryEntryRepository();
    await entryRepository.create(reviewEntryFixture);
    const handler = createGetEventEntryHandler({
      entryRepository,
      entrySourceSummaryRepository: createSourceSummaryRepository()
    });

    await expect(
      handler({
        method: "POST",
        path: "/get-event-entry",
        body: JSON.stringify({ entryId: "missing-entry" })
      })
    ).rejects.toMatchObject({
      code: "EVENT_ENTRY_NOT_FOUND",
      statusCode: 404
    });

    await expect(
      handler({
        method: "POST",
        path: "/get-event-entry",
        body: JSON.stringify({ entryId: "review-1" })
      })
    ).rejects.toMatchObject({
      code: "EVENT_ENTRY_NOT_FOUND",
      statusCode: 404
    });
  });

  it("lists active event entries for a topic in repository order", async () => {
    const entryRepository = new InMemoryEntryRepository();
    const olderEntry: Entry = {
      ...eventEntryFixture,
      id: "entry-older",
      title: "Older event",
      sortAt: "2026-04-24T00:00:00.000Z",
      createdAt: "2026-04-24T01:00:00.000Z",
      updatedAt: "2026-04-24T01:00:00.000Z"
    };
    const newerEntry: Entry = {
      ...eventEntryFixture,
      id: "entry-newer",
      title: "Newer event",
      sortAt: "2026-04-26T00:00:00.000Z",
      createdAt: "2026-04-26T01:00:00.000Z",
      updatedAt: "2026-04-26T01:00:00.000Z"
    };
    await entryRepository.create(olderEntry);
    await entryRepository.create(newerEntry);
    await entryRepository.create({
      ...eventEntryFixture,
      id: "entry-other-topic",
      topicId: "topic-2"
    });
    await entryRepository.create(reviewEntryFixture);
    await entryRepository.create({
      ...eventEntryFixture,
      id: "entry-archived",
      status: "archived",
      archivedAt: "2026-04-27T00:00:00.000Z"
    });
    const handler = createListEventEntriesHandler({
      entryRepository,
      entrySourceSummaryRepository: createSourceSummaryRepository({
        "entry-newer": [buildSourceSummaryFixture()]
      })
    });

    const result = await handler({
      method: "POST",
      path: "/list-event-entries",
      body: JSON.stringify({ topicId: " topic-1 " })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      entries: [
        { ...newerEntry, sources: [buildSourceSummaryFixture()] },
        { ...olderEntry, sources: [] }
      ]
    });
  });

  it("rejects invalid event entry list requests", async () => {
    const handler = createListEventEntriesHandler({
      entryRepository: new InMemoryEntryRepository(),
      entrySourceSummaryRepository: createSourceSummaryRepository()
    });

    for (const body of [{}, { topicId: " " }]) {
      await expect(
        handler({
          method: "POST",
          path: "/list-event-entries",
          body: JSON.stringify(body)
        })
      ).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
        statusCode: 400
      });
    }

    await expect(
      handler({
        method: "POST",
        path: "/list-event-entries",
        body: "{"
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
  });

  it("updates editable event entry fields", async () => {
    const entryRepository = new InMemoryEntryRepository();
    await entryRepository.create(eventEntryFixture);
    const handler = createUpdateEventEntryHandler({
      entryRepository,
      now: () => new Date("2026-04-26T01:00:00.000Z")
    });

    const result = await handler({
      method: "POST",
      path: "/update-event-entry",
      body: JSON.stringify({
        entryId: " entry-1 ",
        title: " Updated event ",
        bodyMd: " Updated event description. ",
        sortAt: " 2026-04-26T00:00:00.000Z ",
        epistemicStatus: "observed"
      })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      entry: {
        ...eventEntryFixture,
        title: "Updated event",
        bodyMd: "Updated event description.",
        sortAt: "2026-04-26T00:00:00.000Z",
        epistemicStatus: "observed",
        updatedAt: "2026-04-26T01:00:00.000Z"
      }
    });
  });

  it("replaces event entry source URLs on update", async () => {
    const entryRepository = new InMemoryEntryRepository();
    const evidenceRepository = new InMemoryEvidenceRepository();
    const entryCitationRepository = new InMemoryEntryCitationRepository();
    await entryRepository.create(eventEntryFixture);
    await entryCitationRepository.createOrFind(
      buildEntryCitationFixture({
        id: "old-managed-source",
        relationType: "source_for"
      })
    );
    await entryCitationRepository.createOrFind(
      buildEntryCitationFixture({
        id: "supporting-citation",
        evidenceItemId: "evidence-support",
        relationType: "supports"
      })
    );
    const handler = createUpdateEventEntryHandler({
      entryRepository,
      evidenceRepository,
      entryCitationRepository,
      generateId: vi
        .fn(() => "unused")
        .mockReturnValueOnce("source-2")
        .mockReturnValueOnce("evidence-2")
        .mockReturnValueOnce("new-source-citation"),
      now: () => new Date("2026-04-26T01:00:00.000Z")
    });

    const result = await handler({
      method: "POST",
      path: "/update-event-entry",
      body: JSON.stringify({
        entryId: "entry-1",
        sources: [{ url: "https://www.reuters.com/world/updated" }]
      })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).entry).toMatchObject({
      id: "entry-1",
      updatedAt: "2026-04-26T01:00:00.000Z"
    });
    await expect(
      entryCitationRepository.listByEntry("entry-1")
    ).resolves.toEqual([
      {
        id: "new-source-citation",
        entryId: "entry-1",
        evidenceItemId: "evidence-2",
        relationType: "source_for",
        createdAt: "2026-04-26T01:00:00.000Z"
      },
      buildEntryCitationFixture({
        id: "supporting-citation",
        evidenceItemId: "evidence-support",
        relationType: "supports"
      })
    ]);
  });

  it("clears event entry source URLs on update", async () => {
    const entryRepository = new InMemoryEntryRepository();
    const entryCitationRepository = new InMemoryEntryCitationRepository();
    await entryRepository.create(eventEntryFixture);
    await entryCitationRepository.createOrFind(
      buildEntryCitationFixture({
        id: "old-managed-source",
        relationType: "source_for"
      })
    );
    const handler = createUpdateEventEntryHandler({
      entryRepository,
      evidenceRepository: new InMemoryEvidenceRepository(),
      entryCitationRepository,
      now: () => new Date("2026-04-26T01:00:00.000Z")
    });

    await handler({
      method: "POST",
      path: "/update-event-entry",
      body: JSON.stringify({
        entryId: "entry-1",
        sources: []
      })
    });

    await expect(
      entryCitationRepository.listByEntry("entry-1")
    ).resolves.toEqual([]);
  });

  it("rejects invalid event update requests", async () => {
    const handler = createUpdateEventEntryHandler({
      entryRepository: new InMemoryEntryRepository()
    });

    for (const body of [
      { entryId: "entry-1" },
      { entryId: " " },
      { entryId: "entry-1", title: " " },
      { entryId: "entry-1", epistemicStatus: "rumored" },
      { entryId: "entry-1", sources: [{ url: "not a url" }] }
    ]) {
      await expect(
        handler({
          method: "POST",
          path: "/update-event-entry",
          body: JSON.stringify(body)
        })
      ).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
        statusCode: 400
      });
    }
  });

  it("rejects missing and non-event entries on event updates", async () => {
    const entryRepository = new InMemoryEntryRepository();
    await entryRepository.create(reviewEntryFixture);
    const handler = createUpdateEventEntryHandler({ entryRepository });

    for (const entryId of ["missing-entry", "review-1"]) {
      await expect(
        handler({
          method: "POST",
          path: "/update-event-entry",
          body: JSON.stringify({ entryId, title: "Updated event" })
        })
      ).rejects.toMatchObject({
        code: "EVENT_ENTRY_NOT_FOUND",
        statusCode: 404
      });
    }
  });

  it("returns persistence unavailable when event read, list, or update storage fails", async () => {
    const entryRepository = {
      create: vi.fn(async (entry: Entry): Promise<Entry> => entry),
      findById: vi.fn(async () => {
        throw new Error("database unavailable");
      }),
      listByTopic: vi.fn(async () => {
        throw new Error("database unavailable");
      }),
      update: vi.fn(async (): Promise<Entry | undefined> => undefined)
    };

    await expect(
      createGetEventEntryHandler({
        entryRepository,
        entrySourceSummaryRepository: createSourceSummaryRepository()
      })({
        method: "POST",
        path: "/get-event-entry",
        body: JSON.stringify({ entryId: "entry-1" })
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });

    await expect(
      createListEventEntriesHandler({
        entryRepository,
        entrySourceSummaryRepository: createSourceSummaryRepository()
      })({
        method: "POST",
        path: "/list-event-entries",
        body: JSON.stringify({ topicId: "topic-1" })
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });

    await expect(
      createUpdateEventEntryHandler({ entryRepository })({
        method: "POST",
        path: "/update-event-entry",
        body: JSON.stringify({ entryId: "entry-1", title: "Updated event" })
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });
  });
});

async function createRepositories() {
  const entryRepository = new InMemoryEntryRepository();
  const topicRepository = new InMemoryTopicRepository();
  await topicRepository.create(topicFixture);

  return { entryRepository, topicRepository };
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

function buildSourceSummaryFixture(
  overrides: Partial<AttachedSourceSummary> = {}
): AttachedSourceSummary {
  return {
    id: "citation-1",
    evidenceItemId: "evidence-1",
    url: "https://www.reuters.com/world/example",
    canonicalUrl: "https://www.reuters.com/world/example",
    title: "Reuters report",
    sourceName: "Reuters",
    sourceDomain: "www.reuters.com",
    publishedAt: "2026-04-24T00:00:00.000Z",
    relationType: "source_for",
    ...overrides
  };
}

const createEventRequestFixture = {
  topicId: "topic-1",
  title: "Court grants injunction",
  bodyMd: "A federal court granted an injunction.",
  sortAt: "2026-04-25T00:00:00.000Z",
  epistemicStatus: "reported"
};

const topicFixture: Topic = {
  id: "topic-1",
  title: "Iran strike risk",
  framingQuestion: "Will tensions escalate?",
  scopeNote: "Track military and diplomatic signals.",
  reviewCadence: "weekly",
  status: "active",
  createdAt: "2026-04-25T00:00:00.000Z",
  updatedAt: "2026-04-25T00:00:00.000Z"
};

const eventEntryFixture: Entry = {
  id: "entry-1",
  topicId: "topic-1",
  kind: "event",
  epistemicStatus: "reported",
  title: "Court grants injunction",
  bodyMd: "A federal court granted an injunction.",
  sortAt: "2026-04-25T00:00:00.000Z",
  isApproximateDate: false,
  originType: "manual",
  status: "active",
  createdAt: "2026-04-25T01:00:00.000Z",
  updatedAt: "2026-04-25T01:00:00.000Z"
};

const reviewEntryFixture: Entry = {
  ...eventEntryFixture,
  id: "review-1",
  kind: "review",
  epistemicStatus: "observed",
  title: "Weekly review",
  bodyMd: "No major developments since the prior review."
};
