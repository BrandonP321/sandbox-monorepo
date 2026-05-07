import { asc, desc, eq, inArray } from "drizzle-orm";

import type { AttachedSourceSummary } from "@repo/signal-tracker-shared";

import { getRuntimeDatabase, type SignalTrackerDb } from "../../db/client";
import { entryCitations, evidenceItems, sources } from "../../db/schema";
import {
  mapEntryCitationRow,
  type EntryCitationRow
} from "../citations/postgres-entry-citation-repository";
import {
  mapEvidenceRows,
  type EvidenceItemRow,
  type SourceRow
} from "../evidence/postgres-evidence-repository";
import {
  buildAttachedSourceSummary,
  type EntrySourceSummaryMap,
  type EntrySourceSummaryRepository
} from "./entry-source-summary-repository";

export type EntrySourceSummaryRows = {
  citation: EntryCitationRow;
  evidenceItem: EvidenceItemRow;
  source: SourceRow;
};

export type EntrySourceSummaryRowStore = {
  selectSourceSummaryRowsByEntryIds(
    entryIds: string[]
  ): Promise<EntrySourceSummaryRows[]>;
};

export class DrizzleEntrySourceSummaryRowStore implements EntrySourceSummaryRowStore {
  constructor(private readonly getDatabase: () => SignalTrackerDb) {}

  async selectSourceSummaryRowsByEntryIds(
    entryIds: string[]
  ): Promise<EntrySourceSummaryRows[]> {
    if (entryIds.length === 0) {
      return [];
    }

    return await this.getDatabase()
      .select({
        citation: entryCitations,
        evidenceItem: evidenceItems,
        source: sources
      })
      .from(entryCitations)
      .innerJoin(
        evidenceItems,
        eq(entryCitations.evidenceItemId, evidenceItems.id)
      )
      .innerJoin(sources, eq(evidenceItems.sourceId, sources.id))
      .where(inArray(entryCitations.entryId, entryIds))
      .orderBy(
        asc(entryCitations.entryId),
        desc(entryCitations.createdAt),
        asc(entryCitations.id)
      );
  }
}

export class PostgresEntrySourceSummaryRepository implements EntrySourceSummaryRepository {
  constructor(
    private readonly store: EntrySourceSummaryRowStore = new DrizzleEntrySourceSummaryRowStore(
      getRuntimeDatabase
    )
  ) {}

  async listByEntryIds(entryIds: string[]): Promise<EntrySourceSummaryMap> {
    const summariesByEntryId = new Map<string, AttachedSourceSummary[]>(
      entryIds.map((entryId) => [entryId, []])
    );
    const rows = await this.store.selectSourceSummaryRowsByEntryIds(
      Array.from(new Set(entryIds))
    );

    for (const row of rows) {
      const citation = mapEntryCitationRow(row.citation);
      const evidence = mapEvidenceRows({
        source: row.source,
        evidenceItem: row.evidenceItem
      });
      const summaries = summariesByEntryId.get(citation.entryId) ?? [];

      summaries.push(buildAttachedSourceSummary(citation, evidence));
      summariesByEntryId.set(citation.entryId, summaries);
    }

    return summariesByEntryId;
  }
}
