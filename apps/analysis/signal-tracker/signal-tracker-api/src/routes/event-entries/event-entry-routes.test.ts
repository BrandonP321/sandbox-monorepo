import { describe, expect, it, vi } from "vitest";

import type { Entry, Topic } from "@repo/signal-tracker-shared";

import { InMemoryEntryRepository } from "../../domain/entries/entry-repository";
import { InMemoryTopicRepository } from "../../domain/topics/topic-repository";
import { createCreateEventEntryHandler } from "./create-event-entry";
import { createGetEventEntryHandler } from "./get-event-entry";
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
    const handler = createGetEventEntryHandler({ entryRepository });

    const result = await handler({
      method: "POST",
      path: "/get-event-entry",
      body: JSON.stringify({ entryId: " entry-1 " })
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ entry: eventEntryFixture });
  });

  it("rejects missing and non-event entries on event reads", async () => {
    const entryRepository = new InMemoryEntryRepository();
    await entryRepository.create(reviewEntryFixture);
    const handler = createGetEventEntryHandler({ entryRepository });

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

  it("rejects invalid event update requests", async () => {
    const handler = createUpdateEventEntryHandler({
      entryRepository: new InMemoryEntryRepository()
    });

    for (const body of [
      { entryId: "entry-1" },
      { entryId: " " },
      { entryId: "entry-1", title: " " },
      { entryId: "entry-1", epistemicStatus: "rumored" }
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

  it("returns persistence unavailable when event read or update storage fails", async () => {
    const entryRepository = {
      create: vi.fn(async (entry: Entry): Promise<Entry> => entry),
      findById: vi.fn(async () => {
        throw new Error("database unavailable");
      }),
      listByTopic: vi.fn(async (): Promise<Entry[]> => []),
      update: vi.fn(async (): Promise<Entry | undefined> => undefined)
    };

    await expect(
      createGetEventEntryHandler({ entryRepository })({
        method: "POST",
        path: "/get-event-entry",
        body: JSON.stringify({ entryId: "entry-1" })
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
