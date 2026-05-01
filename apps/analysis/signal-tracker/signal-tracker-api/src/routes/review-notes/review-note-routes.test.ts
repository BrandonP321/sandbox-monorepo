import { describe, expect, it, vi } from "vitest";

import type { Entry, Topic } from "@repo/signal-tracker-shared";

import { InMemoryEntryRepository } from "../../domain/entries/entry-repository";
import { InMemoryTopicRepository } from "../../domain/topics/topic-repository";
import { createCreateReviewNoteHandler } from "./create-review-note";
import { createGetReviewNoteHandler } from "./get-review-note";
import { createListReviewNotesHandler } from "./list-review-notes";

describe("review note routes", () => {
  it("creates a review note for an existing topic", async () => {
    const { entryRepository, topicRepository } = await createRepositories();
    const handler = createCreateReviewNoteHandler({
      entryRepository,
      topicRepository,
      generateId: () => "review-1",
      now: () => new Date("2026-04-25T01:00:00.000Z")
    });

    const result = await handler({
      method: "POST",
      path: "/create-review-note",
      body: JSON.stringify({
        topicId: " topic-1 ",
        title: " Weekly review ",
        bodyMd: " No major developments since the prior review. ",
        sortAt: " 2026-04-25T00:00:00.000Z ",
        epistemicStatus: "observed"
      })
    });

    const expectedEntry: Entry = {
      id: "review-1",
      topicId: "topic-1",
      kind: "review",
      epistemicStatus: "observed",
      title: "Weekly review",
      bodyMd: "No major developments since the prior review.",
      sortAt: "2026-04-25T00:00:00.000Z",
      isApproximateDate: false,
      originType: "manual",
      status: "active",
      createdAt: "2026-04-25T01:00:00.000Z",
      updatedAt: "2026-04-25T01:00:00.000Z"
    };
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ entry: expectedEntry });
    await expect(entryRepository.findById("review-1")).resolves.toEqual(
      expectedEntry
    );
  });

  it("rejects invalid review note creation requests", async () => {
    const { entryRepository, topicRepository } = await createRepositories();
    const handler = createCreateReviewNoteHandler({
      entryRepository,
      topicRepository
    });

    for (const body of [
      {},
      {
        topicId: "topic-1",
        title: " ",
        bodyMd: "No major developments since the prior review.",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "observed"
      },
      {
        topicId: "topic-1",
        title: "Weekly review",
        bodyMd: " ",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "observed"
      },
      {
        topicId: "topic-1",
        title: "Weekly review",
        bodyMd: "No major developments since the prior review.",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "rumored"
      }
    ]) {
      await expect(
        handler({
          method: "POST",
          path: "/create-review-note",
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
        path: "/create-review-note",
        body: "{"
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
  });

  it("returns not found when creating a review note for a missing topic", async () => {
    const handler = createCreateReviewNoteHandler({
      entryRepository: new InMemoryEntryRepository(),
      topicRepository: new InMemoryTopicRepository()
    });

    await expect(
      handler({
        method: "POST",
        path: "/create-review-note",
        body: JSON.stringify(createReviewNoteRequestFixture)
      })
    ).rejects.toMatchObject({
      code: "TOPIC_NOT_FOUND",
      statusCode: 404
    });
  });

  it("returns persistence unavailable when review note creation storage fails", async () => {
    const { topicRepository } = await createRepositories();
    const handler = createCreateReviewNoteHandler({
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
        path: "/create-review-note",
        body: JSON.stringify(createReviewNoteRequestFixture)
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });
  });

  it("reads a review note by ID", async () => {
    const entryRepository = new InMemoryEntryRepository();
    await entryRepository.create(reviewNoteFixture);
    const handler = createGetReviewNoteHandler({ entryRepository });

    const result = await handler({
      method: "POST",
      path: "/get-review-note",
      body: JSON.stringify({ entryId: " review-1 " })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ entry: reviewNoteFixture });
  });

  it("rejects missing and non-review entries on review note reads", async () => {
    const entryRepository = new InMemoryEntryRepository();
    await entryRepository.create(eventEntryFixture);
    const handler = createGetReviewNoteHandler({ entryRepository });

    await expect(
      handler({
        method: "POST",
        path: "/get-review-note",
        body: JSON.stringify({ entryId: "missing-entry" })
      })
    ).rejects.toMatchObject({
      code: "REVIEW_NOTE_NOT_FOUND",
      statusCode: 404
    });

    await expect(
      handler({
        method: "POST",
        path: "/get-review-note",
        body: JSON.stringify({ entryId: "entry-1" })
      })
    ).rejects.toMatchObject({
      code: "REVIEW_NOTE_NOT_FOUND",
      statusCode: 404
    });
  });

  it("lists active review notes for a topic in repository order", async () => {
    const entryRepository = new InMemoryEntryRepository();
    const olderReviewNote: Entry = {
      ...reviewNoteFixture,
      id: "review-older",
      title: "Older review",
      sortAt: "2026-04-24T00:00:00.000Z",
      createdAt: "2026-04-24T01:00:00.000Z",
      updatedAt: "2026-04-24T01:00:00.000Z"
    };
    const newerReviewNote: Entry = {
      ...reviewNoteFixture,
      id: "review-newer",
      title: "Newer review",
      sortAt: "2026-04-26T00:00:00.000Z",
      createdAt: "2026-04-26T01:00:00.000Z",
      updatedAt: "2026-04-26T01:00:00.000Z"
    };
    await entryRepository.create(olderReviewNote);
    await entryRepository.create(newerReviewNote);
    await entryRepository.create({
      ...reviewNoteFixture,
      id: "review-other-topic",
      topicId: "topic-2"
    });
    await entryRepository.create(eventEntryFixture);
    await entryRepository.create({
      ...reviewNoteFixture,
      id: "review-archived",
      status: "archived",
      archivedAt: "2026-04-27T00:00:00.000Z"
    });
    const handler = createListReviewNotesHandler({ entryRepository });

    const result = await handler({
      method: "POST",
      path: "/list-review-notes",
      body: JSON.stringify({ topicId: " topic-1 " })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      entries: [newerReviewNote, olderReviewNote]
    });
  });

  it("rejects invalid review note list requests", async () => {
    const handler = createListReviewNotesHandler({
      entryRepository: new InMemoryEntryRepository()
    });

    for (const body of [{}, { topicId: " " }]) {
      await expect(
        handler({
          method: "POST",
          path: "/list-review-notes",
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
        path: "/list-review-notes",
        body: "{"
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      statusCode: 400
    });
  });

  it("returns persistence unavailable when review note read or list storage fails", async () => {
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
      createGetReviewNoteHandler({ entryRepository })({
        method: "POST",
        path: "/get-review-note",
        body: JSON.stringify({ entryId: "review-1" })
      })
    ).rejects.toMatchObject({
      code: "PERSISTENCE_UNAVAILABLE",
      statusCode: 503
    });

    await expect(
      createListReviewNotesHandler({ entryRepository })({
        method: "POST",
        path: "/list-review-notes",
        body: JSON.stringify({ topicId: "topic-1" })
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

const createReviewNoteRequestFixture = {
  topicId: "topic-1",
  title: "Weekly review",
  bodyMd: "No major developments since the prior review.",
  sortAt: "2026-04-25T00:00:00.000Z",
  epistemicStatus: "observed"
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

const reviewNoteFixture: Entry = {
  id: "review-1",
  topicId: "topic-1",
  kind: "review",
  epistemicStatus: "observed",
  title: "Weekly review",
  bodyMd: "No major developments since the prior review.",
  sortAt: "2026-04-25T00:00:00.000Z",
  isApproximateDate: false,
  originType: "manual",
  status: "active",
  createdAt: "2026-04-25T01:00:00.000Z",
  updatedAt: "2026-04-25T01:00:00.000Z"
};

const eventEntryFixture: Entry = {
  ...reviewNoteFixture,
  id: "entry-1",
  kind: "event",
  epistemicStatus: "reported",
  title: "Court grants injunction",
  bodyMd: "A federal court granted an injunction."
};
