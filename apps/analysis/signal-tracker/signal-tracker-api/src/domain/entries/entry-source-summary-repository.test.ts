import { describe, expect, it } from "vitest";

import {
  buildAttachedSourceSummary,
  InMemoryEntrySourceSummaryRepository
} from "./entry-source-summary-repository";
import {
  PostgresEntrySourceSummaryRepository,
  type EntrySourceSummaryRows
} from "./postgres-entry-source-summary-repository";
import {
  buildEntryCitationFixture,
  buildEvidenceRecordFixture,
  buildSourceFixture,
  entryCitationToRow,
  evidenceItemToRow,
  sourceToRow
} from "../test-fixtures";

describe("entry source summary repositories", () => {
  it("derives compact source summaries from citation and evidence records", () => {
    const citation = buildEntryCitationFixture({
      id: "citation-1",
      evidenceItemId: "evidence-1",
      relationType: "contextualizes"
    });
    const evidence = buildEvidenceRecordFixture();

    expect(buildAttachedSourceSummary(citation, evidence)).toEqual({
      id: "citation-1",
      evidenceItemId: "evidence-1",
      url: "https://www.reuters.com/world/example",
      canonicalUrl: "https://www.reuters.com/world/example",
      title: "Court grants injunction",
      sourceName: "Reuters",
      sourceDomain: "www.reuters.com",
      publishedAt: "2026-04-24T00:00:00.000Z",
      relationType: "contextualizes"
    });
  });

  it("uses display-safe fallbacks when URL metadata is sparse", () => {
    const citation = buildEntryCitationFixture({
      id: "citation-1",
      evidenceItemId: "evidence-1",
      relationType: "source_for"
    });
    const evidence = buildEvidenceRecordFixture({
      source: buildSourceFixture({
        baseUrl: undefined,
        canonicalName: "Sparse Source"
      }),
      evidenceItem: {
        ...buildEvidenceRecordFixture().evidenceItem,
        sourceId: "source-1",
        canonicalUrl: undefined,
        publishedAt: undefined,
        title: "Sparse Source"
      }
    });

    expect(buildAttachedSourceSummary(citation, evidence)).toEqual({
      id: "citation-1",
      evidenceItemId: "evidence-1",
      title: "Sparse Source",
      sourceName: "Sparse Source",
      relationType: "source_for"
    });
  });

  it("returns empty arrays for entries without attached sources", async () => {
    const repository = new InMemoryEntrySourceSummaryRepository();

    await expect(repository.listByEntryIds(["entry-1"])).resolves.toEqual(
      new Map([["entry-1", []]])
    );
  });

  it("batches Postgres-backed source summaries by entry ID", async () => {
    const rows = [
      buildSummaryRows({
        citationId: "citation-new",
        entryId: "entry-1",
        evidenceItemId: "evidence-new",
        createdAt: "2026-04-26T00:00:00.000Z"
      }),
      buildSummaryRows({
        citationId: "citation-old",
        entryId: "entry-1",
        evidenceItemId: "evidence-old",
        createdAt: "2026-04-25T00:00:00.000Z"
      }),
      buildSummaryRows({
        citationId: "citation-other",
        entryId: "entry-2",
        evidenceItemId: "evidence-other",
        createdAt: "2026-04-25T00:00:00.000Z"
      })
    ];
    const repository = new PostgresEntrySourceSummaryRepository({
      selectSourceSummaryRowsByEntryIds: async () => rows
    });

    const result = await repository.listByEntryIds([
      "entry-1",
      "entry-2",
      "entry-3"
    ]);

    expect(result.get("entry-1")).toMatchObject([
      { id: "citation-new", evidenceItemId: "evidence-new" },
      { id: "citation-old", evidenceItemId: "evidence-old" }
    ]);
    expect(result.get("entry-2")).toMatchObject([
      { id: "citation-other", evidenceItemId: "evidence-other" }
    ]);
    expect(result.get("entry-3")).toEqual([]);
  });
});

function buildSummaryRows({
  citationId,
  createdAt,
  entryId,
  evidenceItemId
}: {
  citationId: string;
  createdAt: string;
  entryId: string;
  evidenceItemId: string;
}): EntrySourceSummaryRows {
  const source = buildSourceFixture({ id: `source-${evidenceItemId}` });
  const evidence = buildEvidenceRecordFixture({
    source,
    evidenceItem: {
      ...buildEvidenceRecordFixture().evidenceItem,
      id: evidenceItemId,
      sourceId: source.id
    }
  });

  return {
    citation: entryCitationToRow(
      buildEntryCitationFixture({
        id: citationId,
        entryId,
        evidenceItemId,
        createdAt
      })
    ),
    evidenceItem: evidenceItemToRow(evidence.evidenceItem),
    source: sourceToRow(evidence.source)
  };
}
