import { describe, expect, it } from "vitest";

import type { Entry } from "@repo/signal-tracker-shared";

import { InMemoryEntryRepository } from "./entry-repository";

describe("InMemoryEntryRepository", () => {
  it("updates editable entry fields and preserves lifecycle metadata", async () => {
    const repository = new InMemoryEntryRepository();
    await repository.create(entryFixture);

    await expect(
      repository.update(
        entryFixture.id,
        {
          title: "Updated event",
          bodyMd: "Updated event description.",
          sortAt: "2026-04-26T00:00:00.000Z",
          epistemicStatus: "observed"
        },
        "2026-04-26T01:00:00.000Z"
      )
    ).resolves.toEqual({
      ...entryFixture,
      title: "Updated event",
      bodyMd: "Updated event description.",
      sortAt: "2026-04-26T00:00:00.000Z",
      epistemicStatus: "observed",
      updatedAt: "2026-04-26T01:00:00.000Z"
    });
  });

  it("returns undefined when updating a missing entry", async () => {
    const repository = new InMemoryEntryRepository();

    await expect(
      repository.update(
        "missing-entry",
        { title: "Updated event" },
        "2026-04-26T01:00:00.000Z"
      )
    ).resolves.toBeUndefined();
  });
});

const entryFixture: Entry = {
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
