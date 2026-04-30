import { describe, expect, it } from "vitest";

import type { Topic } from "@repo/signal-tracker-shared";

import { InMemoryTopicRepository } from "../topics/topic-repository";
import {
  createEntryRecord,
  EntryTopicNotFoundError,
  type CreateEntryInput
} from "./create-entry";
import { InMemoryEntryRepository } from "./entry-repository";

describe("createEntryRecord", () => {
  it("creates an active manual entry after validating the topic exists", async () => {
    const topicRepository = new InMemoryTopicRepository();
    const entryRepository = new InMemoryEntryRepository();
    await topicRepository.create(topicFixture);

    await expect(
      createEntryRecord(entryInputFixture, {
        entryRepository,
        topicRepository,
        generateId: () => "entry-1",
        now: () => new Date("2026-04-25T01:00:00.000Z")
      })
    ).resolves.toEqual({
      id: "entry-1",
      ...entryInputFixture,
      isApproximateDate: false,
      originType: "manual",
      status: "active",
      createdAt: "2026-04-25T01:00:00.000Z",
      updatedAt: "2026-04-25T01:00:00.000Z"
    });
  });

  it("preserves explicit approximate-date and origin metadata", async () => {
    const topicRepository = new InMemoryTopicRepository();
    const entryRepository = new InMemoryEntryRepository();
    await topicRepository.create(topicFixture);

    await expect(
      createEntryRecord(
        {
          ...entryInputFixture,
          isApproximateDate: true,
          originType: "import"
        },
        {
          entryRepository,
          topicRepository,
          generateId: () => "entry-1",
          now: () => new Date("2026-04-25T01:00:00.000Z")
        }
      )
    ).resolves.toMatchObject({
      isApproximateDate: true,
      originType: "import"
    });
  });

  it("rejects entries scoped to missing topics before writing", async () => {
    const entryRepository = new InMemoryEntryRepository();

    await expect(
      createEntryRecord(entryInputFixture, {
        entryRepository,
        topicRepository: new InMemoryTopicRepository(),
        generateId: () => "entry-1",
        now: () => new Date("2026-04-25T01:00:00.000Z")
      })
    ).rejects.toBeInstanceOf(EntryTopicNotFoundError);

    await expect(entryRepository.findById("entry-1")).resolves.toBeUndefined();
  });
});

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

const entryInputFixture: CreateEntryInput = {
  topicId: "topic-1",
  kind: "event",
  epistemicStatus: "reported",
  title: "Court grants injunction",
  bodyMd: "A federal court granted an injunction.",
  sortAt: "2026-04-25T00:00:00.000Z"
};
