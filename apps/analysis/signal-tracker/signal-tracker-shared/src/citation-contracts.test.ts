import { describe, expect, it } from "vitest";

import {
  attachEntryCitationRequestSchema,
  attachEntryCitationResponseSchema,
  detachEntryCitationRequestSchema,
  entryCitationRelationTypeSchema,
  entryCitationSchema,
  listEntryCitationsRequestSchema,
  listEntryCitationsResponseSchema
} from "./citation-contracts.js";

describe("citation contracts", () => {
  it("validates citation relation types", () => {
    expect(entryCitationRelationTypeSchema.options).toEqual([
      "supports",
      "contradicts",
      "contextualizes",
      "source_for"
    ]);
  });

  it("validates attach citation requests with defaults and trimmed fields", () => {
    expect(
      attachEntryCitationRequestSchema.parse({
        entryId: " entry-1 ",
        evidenceItemId: " evidence-1 ",
        evidenceAnchorId: " anchor-1 ",
        note: " Supporting note "
      })
    ).toEqual({
      entryId: "entry-1",
      evidenceItemId: "evidence-1",
      evidenceAnchorId: "anchor-1",
      relationType: "supports",
      note: "Supporting note"
    });

    expect(
      attachEntryCitationRequestSchema.parse({
        entryId: "entry-1",
        evidenceItemId: "evidence-1",
        relationType: "contradicts",
        note: " "
      })
    ).toEqual({
      entryId: "entry-1",
      evidenceItemId: "evidence-1",
      relationType: "contradicts"
    });
  });

  it("rejects invalid citation requests", () => {
    for (const body of [
      {},
      { entryId: "entry-1", evidenceItemId: " " },
      {
        entryId: "entry-1",
        evidenceItemId: "evidence-1",
        relationType: "proves"
      }
    ]) {
      expect(() => attachEntryCitationRequestSchema.parse(body)).toThrow();
    }
  });

  it("validates detach and list citation requests", () => {
    expect(
      detachEntryCitationRequestSchema.parse({
        entryId: " entry-1 ",
        citationId: " citation-1 "
      })
    ).toEqual({
      entryId: "entry-1",
      citationId: "citation-1"
    });

    expect(
      listEntryCitationsRequestSchema.parse({ entryId: " entry-1 " })
    ).toEqual({
      entryId: "entry-1"
    });
  });

  it("validates citation response shapes", () => {
    const citation = entryCitationSchema.parse({
      id: "citation-1",
      entryId: "entry-1",
      evidenceItemId: "evidence-1",
      evidenceAnchorId: "anchor-1",
      relationType: "supports",
      note: "Supports the event wording.",
      createdAt: "2026-04-25T00:00:00.000Z"
    });
    const record = {
      citation,
      evidence: {
        source: {
          id: "source-1",
          canonicalName: "Reuters",
          sourceType: "news",
          createdAt: "2026-04-25T00:00:00.000Z",
          updatedAt: "2026-04-25T00:00:00.000Z"
        },
        evidenceItem: {
          id: "evidence-1",
          sourceId: "source-1",
          title: "Court grants injunction",
          capturedAt: "2026-04-25T00:00:00.000Z",
          metadata: {},
          createdAt: "2026-04-25T00:00:00.000Z",
          updatedAt: "2026-04-25T00:00:00.000Z"
        }
      },
      anchor: {
        id: "anchor-1",
        evidenceItemId: "evidence-1",
        quoteText: "A federal court granted an injunction.",
        locator: {},
        createdAt: "2026-04-25T00:00:00.000Z",
        updatedAt: "2026-04-25T00:00:00.000Z"
      }
    };

    expect(
      attachEntryCitationResponseSchema.parse({ citation: record })
    ).toEqual({
      citation: record
    });
    expect(
      listEntryCitationsResponseSchema.parse({ citations: [record] })
    ).toEqual({
      citations: [record]
    });
  });
});
