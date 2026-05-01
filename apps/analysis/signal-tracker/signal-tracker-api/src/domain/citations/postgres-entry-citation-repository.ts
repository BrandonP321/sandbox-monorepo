import { and, asc, desc, eq, isNull } from "drizzle-orm";

import {
  entryCitationSchema,
  type EntryCitation
} from "@repo/signal-tracker-shared";

import { getRuntimeDatabase, type SignalTrackerDb } from "../../db/client";
import { entryCitations } from "../../db/schema";
import { toDate, toIsoTimestamp } from "../persistence/timestamps";
import type { EntryCitationRepository } from "./entry-citation-repository";

export type EntryCitationRow = typeof entryCitations.$inferSelect;
export type NewEntryCitationRow = typeof entryCitations.$inferInsert;

export type EntryCitationRowStore = {
  insertOrSelectEntryCitation(
    citation: NewEntryCitationRow
  ): Promise<EntryCitationRow>;
  selectEntryCitationById(id: string): Promise<EntryCitationRow | undefined>;
  selectEntryCitationsByEntry(entryId: string): Promise<EntryCitationRow[]>;
  deleteEntryCitationForEntry(
    entryId: string,
    citationId: string
  ): Promise<EntryCitationRow | undefined>;
};

export class DrizzleEntryCitationRowStore implements EntryCitationRowStore {
  constructor(private readonly getDatabase: () => SignalTrackerDb) {}

  async insertOrSelectEntryCitation(
    citation: NewEntryCitationRow
  ): Promise<EntryCitationRow> {
    const existingCitation = await this.selectExistingEntryCitation(citation);

    if (existingCitation) {
      return existingCitation;
    }

    const [row] = await this.getDatabase()
      .insert(entryCitations)
      .values(citation)
      .returning();

    if (!row) {
      throw new Error("Entry citation insert did not return a row");
    }

    return row;
  }

  async selectEntryCitationById(
    id: string
  ): Promise<EntryCitationRow | undefined> {
    const [row] = await this.getDatabase()
      .select()
      .from(entryCitations)
      .where(eq(entryCitations.id, id))
      .limit(1);

    return row;
  }

  async selectEntryCitationsByEntry(
    entryId: string
  ): Promise<EntryCitationRow[]> {
    return await this.getDatabase()
      .select()
      .from(entryCitations)
      .where(eq(entryCitations.entryId, entryId))
      .orderBy(desc(entryCitations.createdAt), asc(entryCitations.id));
  }

  async deleteEntryCitationForEntry(
    entryId: string,
    citationId: string
  ): Promise<EntryCitationRow | undefined> {
    const [row] = await this.getDatabase()
      .delete(entryCitations)
      .where(
        and(
          eq(entryCitations.entryId, entryId),
          eq(entryCitations.id, citationId)
        )
      )
      .returning();

    return row;
  }

  private async selectExistingEntryCitation(
    citation: NewEntryCitationRow
  ): Promise<EntryCitationRow | undefined> {
    const anchorPredicate = citation.evidenceAnchorId
      ? eq(entryCitations.evidenceAnchorId, citation.evidenceAnchorId)
      : isNull(entryCitations.evidenceAnchorId);
    const [row] = await this.getDatabase()
      .select()
      .from(entryCitations)
      .where(
        and(
          eq(entryCitations.entryId, citation.entryId),
          eq(entryCitations.evidenceItemId, citation.evidenceItemId),
          anchorPredicate,
          eq(entryCitations.relationType, citation.relationType ?? "supports")
        )
      )
      .limit(1);

    return row;
  }
}

export class PostgresEntryCitationRepository implements EntryCitationRepository {
  constructor(
    private readonly store: EntryCitationRowStore = new DrizzleEntryCitationRowStore(
      getRuntimeDatabase
    )
  ) {}

  async createOrFind(citation: EntryCitation): Promise<EntryCitation> {
    const row = await this.store.insertOrSelectEntryCitation(
      mapEntryCitationToNewEntryCitationRow(citation)
    );

    return mapEntryCitationRow(row);
  }

  async findById(id: string): Promise<EntryCitation | undefined> {
    const row = await this.store.selectEntryCitationById(id);

    return row ? mapEntryCitationRow(row) : undefined;
  }

  async listByEntry(entryId: string): Promise<EntryCitation[]> {
    const rows = await this.store.selectEntryCitationsByEntry(entryId);

    return rows.map(mapEntryCitationRow);
  }

  async deleteForEntry(
    entryId: string,
    citationId: string
  ): Promise<EntryCitation | undefined> {
    const row = await this.store.deleteEntryCitationForEntry(
      entryId,
      citationId
    );

    return row ? mapEntryCitationRow(row) : undefined;
  }
}

export function mapEntryCitationRow(row: EntryCitationRow): EntryCitation {
  return entryCitationSchema.parse({
    id: row.id,
    entryId: row.entryId,
    evidenceItemId: row.evidenceItemId,
    evidenceAnchorId: row.evidenceAnchorId ?? undefined,
    relationType: row.relationType,
    note: row.note ?? undefined,
    createdAt: toIsoTimestamp(row.createdAt)
  });
}

export function mapEntryCitationToNewEntryCitationRow(
  citation: EntryCitation
): NewEntryCitationRow {
  return {
    id: citation.id,
    entryId: citation.entryId,
    evidenceItemId: citation.evidenceItemId,
    evidenceAnchorId: citation.evidenceAnchorId ?? null,
    relationType: citation.relationType,
    note: citation.note ?? null,
    createdAt: toDate(citation.createdAt)
  };
}
