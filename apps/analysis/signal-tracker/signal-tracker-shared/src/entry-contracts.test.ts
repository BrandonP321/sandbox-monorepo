import { describe, expect, it } from "vitest";

import {
  attachedSourceSummarySchema,
  createEventEntryRequestSchema,
  createEventEntryResponseSchema,
  entrySourceInputSchema,
  createReviewNoteRequestSchema,
  createReviewNoteResponseSchema,
  entryEpistemicStatusSchema,
  entryKindSchema,
  entryReadModelSchema,
  entryOriginTypeSchema,
  entrySchema,
  entryStatusSchema,
  getEventEntryRequestSchema,
  getEventEntryResponseSchema,
  getReviewNoteRequestSchema,
  getReviewNoteResponseSchema,
  listEventEntriesRequestSchema,
  listEventEntriesResponseSchema,
  listReviewNotesRequestSchema,
  listReviewNotesResponseSchema,
  updateEventEntryRequestSchema,
  updateEventEntryResponseSchema
} from "./entry-contracts.js";

describe("entry contracts", () => {
  it("validates entry taxonomy values", () => {
    expect(entryKindSchema.options).toEqual(["event", "assessment", "review"]);
    expect(entryEpistemicStatusSchema.options).toEqual([
      "observed",
      "reported",
      "inferred",
      "forecast"
    ]);
    expect(entryOriginTypeSchema.options).toEqual([
      "manual",
      "import",
      "ai_suggestion"
    ]);
    expect(entryStatusSchema.options).toEqual([
      "active",
      "archived",
      "deleted"
    ]);
  });

  it("validates a full base entry domain shape", () => {
    expect(
      entrySchema.parse({
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
      })
    ).toEqual({
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
    });
  });

  it("validates hydrated entry read models with attached source summaries", () => {
    const source = attachedSourceSummarySchema.parse({
      id: "citation-1",
      evidenceItemId: "evidence-1",
      url: " https://www.reuters.com/world/example ",
      canonicalUrl: " https://www.reuters.com/world/example ",
      title: " Reuters report ",
      sourceName: " Reuters ",
      sourceDomain: " www.reuters.com ",
      publishedAt: "2026-04-24T00:00:00.000Z",
      relationType: "source_for"
    });
    const entry = buildEntryReadModel({ sources: [source] });

    expect(entryReadModelSchema.parse(entry)).toEqual(entry);
    expect(
      entryReadModelSchema.parse({ ...entry, sources: undefined })
    ).toEqual({
      ...entry,
      sources: []
    });
  });

  it("validates hidden approximate-date and entry lifecycle timestamp fields", () => {
    const entry = entrySchema.parse({
      id: "entry-1",
      topicId: "topic-1",
      kind: "review",
      epistemicStatus: "observed",
      title: "Weekly review",
      bodyMd: "No major developments since the prior review.",
      sortAt: "2026-04-25T00:00:00.000Z",
      isApproximateDate: true,
      originType: "import",
      status: "archived",
      createdAt: "2026-04-25T01:00:00.000Z",
      updatedAt: "2026-04-26T01:00:00.000Z",
      archivedAt: "2026-04-26T01:00:00.000Z",
      deletedAt: "2026-04-27T01:00:00.000Z"
    });

    expect(entry.isApproximateDate).toBe(true);
    expect(entry.archivedAt).toBe("2026-04-26T01:00:00.000Z");
    expect(entry.deletedAt).toBe("2026-04-27T01:00:00.000Z");
  });

  it("rejects invalid entry domain values", () => {
    const baseEntry = {
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

    expect(() => entrySchema.parse({ ...baseEntry, kind: "claim" })).toThrow();
    expect(() =>
      entrySchema.parse({ ...baseEntry, epistemicStatus: "rumored" })
    ).toThrow();
    expect(() =>
      entrySchema.parse({ ...baseEntry, originType: "crawler" })
    ).toThrow();
    expect(() =>
      entrySchema.parse({ ...baseEntry, status: "paused" })
    ).toThrow();
    expect(() => entrySchema.parse({ ...baseEntry, title: " " })).toThrow();
    expect(() => entrySchema.parse({ ...baseEntry, bodyMd: " " })).toThrow();
  });

  it("validates event entry creation requests", () => {
    expect(
      createEventEntryRequestSchema.parse({
        topicId: " topic-1 ",
        title: " Court grants injunction ",
        bodyMd: " A federal court granted an injunction. ",
        sortAt: " 2026-04-25T00:00:00.000Z ",
        epistemicStatus: "reported",
        sources: [{ url: " https://www.reuters.com/world/example " }]
      })
    ).toEqual({
      topicId: "topic-1",
      title: "Court grants injunction",
      bodyMd: "A federal court granted an injunction.",
      sortAt: "2026-04-25T00:00:00.000Z",
      epistemicStatus: "reported",
      sources: [{ url: "https://www.reuters.com/world/example" }]
    });

    expect(() =>
      createEventEntryRequestSchema.parse({
        topicId: "topic-1",
        title: " ",
        bodyMd: "A federal court granted an injunction.",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "reported"
      })
    ).toThrow();
    expect(() =>
      createEventEntryRequestSchema.parse({
        topicId: "topic-1",
        title: "Court grants injunction",
        bodyMd: " ",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "reported"
      })
    ).toThrow();
    expect(() =>
      createEventEntryRequestSchema.parse({
        topicId: "topic-1",
        title: "Court grants injunction",
        bodyMd: "A federal court granted an injunction.",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "rumored"
      })
    ).toThrow();
    expect(() =>
      createEventEntryRequestSchema.parse({
        topicId: "topic-1",
        title: "Court grants injunction",
        bodyMd: "A federal court granted an injunction.",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "reported",
        sources: [{ url: "ftp://example.com/file" }]
      })
    ).toThrow();
  });

  it("validates entry source URL inputs", () => {
    expect(
      entrySourceInputSchema.parse({
        url: " https://example.com/source "
      })
    ).toEqual({
      url: "https://example.com/source"
    });

    expect(() =>
      entrySourceInputSchema.parse({ url: "ftp://example.com/file" })
    ).toThrow();
    expect(() => entrySourceInputSchema.parse({ url: "not a url" })).toThrow();
  });

  it("validates review note creation requests", () => {
    expect(
      createReviewNoteRequestSchema.parse({
        topicId: " topic-1 ",
        title: " Weekly review ",
        bodyMd: " No major developments since the prior review. ",
        sortAt: " 2026-04-25T00:00:00.000Z ",
        epistemicStatus: "observed"
      })
    ).toEqual({
      topicId: "topic-1",
      title: "Weekly review",
      bodyMd: "No major developments since the prior review.",
      sortAt: "2026-04-25T00:00:00.000Z",
      epistemicStatus: "observed"
    });

    expect(() =>
      createReviewNoteRequestSchema.parse({
        topicId: "topic-1",
        title: " ",
        bodyMd: "No major developments since the prior review.",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "observed"
      })
    ).toThrow();
    expect(() =>
      createReviewNoteRequestSchema.parse({
        topicId: "topic-1",
        title: "Weekly review",
        bodyMd: " ",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "observed"
      })
    ).toThrow();
    expect(() =>
      createReviewNoteRequestSchema.parse({
        topicId: "topic-1",
        title: "Weekly review",
        bodyMd: "No major developments since the prior review.",
        sortAt: "2026-04-25T00:00:00.000Z",
        epistemicStatus: "rumored"
      })
    ).toThrow();
  });

  it("validates event entry read and update requests", () => {
    expect(getEventEntryRequestSchema.parse({ entryId: " entry-1 " })).toEqual({
      entryId: "entry-1"
    });
    expect(() => getEventEntryRequestSchema.parse({ entryId: " " })).toThrow();
    expect(
      listEventEntriesRequestSchema.parse({ topicId: " topic-1 " })
    ).toEqual({
      topicId: "topic-1"
    });
    expect(() =>
      listEventEntriesRequestSchema.parse({ topicId: " " })
    ).toThrow();

    expect(
      updateEventEntryRequestSchema.parse({
        entryId: " entry-1 ",
        title: " Updated event ",
        bodyMd: " Updated description. ",
        sortAt: " 2026-04-26T00:00:00.000Z ",
        epistemicStatus: "observed",
        sources: [{ url: " https://www.reuters.com/world/example " }]
      })
    ).toEqual({
      entryId: "entry-1",
      title: "Updated event",
      bodyMd: "Updated description.",
      sortAt: "2026-04-26T00:00:00.000Z",
      epistemicStatus: "observed",
      sources: [{ url: "https://www.reuters.com/world/example" }]
    });

    expect(
      updateEventEntryRequestSchema.parse({
        entryId: "entry-1",
        sources: []
      })
    ).toEqual({ entryId: "entry-1", sources: [] });
    expect(() =>
      updateEventEntryRequestSchema.parse({ entryId: "entry-1" })
    ).toThrow();
    expect(() =>
      updateEventEntryRequestSchema.parse({
        entryId: "entry-1",
        epistemicStatus: "rumored"
      })
    ).toThrow();
  });

  it("validates review note read and list requests", () => {
    expect(getReviewNoteRequestSchema.parse({ entryId: " review-1 " })).toEqual(
      {
        entryId: "review-1"
      }
    );
    expect(() => getReviewNoteRequestSchema.parse({ entryId: " " })).toThrow();
    expect(
      listReviewNotesRequestSchema.parse({ topicId: " topic-1 " })
    ).toEqual({
      topicId: "topic-1"
    });
    expect(() =>
      listReviewNotesRequestSchema.parse({ topicId: " " })
    ).toThrow();
  });

  it("validates event entry response shapes", () => {
    const entry = buildEntryReadModel({ kind: "event" });
    const domainEntry = toDomainEntry(entry);

    expect(createEventEntryResponseSchema.parse({ entry })).toEqual({
      entry: domainEntry
    });
    expect(getEventEntryResponseSchema.parse({ entry })).toEqual({ entry });
    expect(listEventEntriesResponseSchema.parse({ entries: [entry] })).toEqual({
      entries: [entry]
    });
    expect(updateEventEntryResponseSchema.parse({ entry })).toEqual({
      entry: domainEntry
    });
  });

  it("validates review note response shapes", () => {
    const entry = entryReadModelSchema.parse({
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
      updatedAt: "2026-04-25T01:00:00.000Z",
      sources: []
    });
    const domainEntry = toDomainEntry(entry);

    expect(createReviewNoteResponseSchema.parse({ entry })).toEqual({
      entry: domainEntry
    });
    expect(getReviewNoteResponseSchema.parse({ entry })).toEqual({ entry });
    expect(listReviewNotesResponseSchema.parse({ entries: [entry] })).toEqual({
      entries: [entry]
    });
  });
});

function toDomainEntry(entry: ReturnType<typeof entryReadModelSchema.parse>) {
  const { sources, ...domainEntry } = entry;
  void sources;

  return domainEntry;
}

function buildEntryReadModel(
  overrides: Partial<ReturnType<typeof entryReadModelSchema.parse>> = {}
) {
  return entryReadModelSchema.parse({
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
    updatedAt: "2026-04-25T01:00:00.000Z",
    sources: [],
    ...overrides
  });
}
