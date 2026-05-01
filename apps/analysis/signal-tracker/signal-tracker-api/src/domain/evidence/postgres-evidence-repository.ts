import { and, asc, desc, eq, ilike, or } from "drizzle-orm";

import {
  evidenceRecordSchema,
  evidenceItemSchema,
  sourceSchema,
  type EvidenceItem,
  type EvidenceRecord,
  type Source
} from "@repo/signal-tracker-shared";

import { getRuntimeDatabase, type SignalTrackerDb } from "../../db/client";
import { evidenceItems, sources } from "../../db/schema";
import {
  nullableDateToIso,
  nullableTimestampToDate,
  toDate,
  toIsoTimestamp
} from "../persistence/timestamps";
import type {
  EvidenceRepository,
  ListEvidenceOptions
} from "./evidence-repository";

export type SourceRow = typeof sources.$inferSelect;
export type NewSourceRow = typeof sources.$inferInsert;
export type EvidenceItemRow = typeof evidenceItems.$inferSelect;
export type NewEvidenceItemRow = typeof evidenceItems.$inferInsert;
export type EvidenceRows = {
  source: SourceRow;
  evidenceItem: EvidenceItemRow;
};

export type EvidenceRowStore = {
  insertEvidenceRecord(
    source: NewSourceRow,
    evidenceItem: NewEvidenceItemRow
  ): Promise<EvidenceRows>;
  selectEvidenceById(id: string): Promise<EvidenceRows | undefined>;
  selectEvidence(options?: ListEvidenceOptions): Promise<EvidenceRows[]>;
};

export class DrizzleEvidenceRowStore implements EvidenceRowStore {
  constructor(private readonly getDatabase: () => SignalTrackerDb) {}

  async insertEvidenceRecord(
    source: NewSourceRow,
    evidenceItem: NewEvidenceItemRow
  ): Promise<EvidenceRows> {
    return await this.getDatabase().transaction(async (tx) => {
      if (evidenceItem.canonicalUrl) {
        const [existingEvidenceRows] = await tx
          .select({
            source: sources,
            evidenceItem: evidenceItems
          })
          .from(evidenceItems)
          .innerJoin(sources, eq(evidenceItems.sourceId, sources.id))
          .where(eq(evidenceItems.canonicalUrl, evidenceItem.canonicalUrl))
          .limit(1);

        if (existingEvidenceRows) {
          return existingEvidenceRows;
        }
      }

      const reusableSource = await selectReusableSource(tx, source);
      const sourceRow = reusableSource ?? (await insertSource(tx, source));
      const [evidenceItemRow] = await tx
        .insert(evidenceItems)
        .values({
          ...evidenceItem,
          sourceId: sourceRow.id
        })
        .returning();

      if (!evidenceItemRow) {
        throw new Error("Evidence item insert did not return a row");
      }

      return { source: sourceRow, evidenceItem: evidenceItemRow };
    });
  }

  async selectEvidenceById(id: string): Promise<EvidenceRows | undefined> {
    const [row] = await this.getDatabase()
      .select({
        source: sources,
        evidenceItem: evidenceItems
      })
      .from(evidenceItems)
      .innerJoin(sources, eq(evidenceItems.sourceId, sources.id))
      .where(eq(evidenceItems.id, id))
      .limit(1);

    return row;
  }

  async selectEvidence(
    options: ListEvidenceOptions = {}
  ): Promise<EvidenceRows[]> {
    const queryPattern = options.query
      ? `%${escapeIlikePattern(options.query)}%`
      : undefined;
    const queryClause = queryPattern
      ? or(
          ilike(evidenceItems.title, queryPattern),
          ilike(evidenceItems.canonicalUrl, queryPattern),
          ilike(sources.canonicalName, queryPattern)
        )
      : undefined;

    return await this.getDatabase()
      .select({
        source: sources,
        evidenceItem: evidenceItems
      })
      .from(evidenceItems)
      .innerJoin(sources, eq(evidenceItems.sourceId, sources.id))
      .where(queryClause)
      .orderBy(
        desc(evidenceItems.capturedAt),
        desc(evidenceItems.createdAt),
        asc(evidenceItems.id)
      );
  }
}

export class PostgresEvidenceRepository implements EvidenceRepository {
  constructor(
    private readonly store: EvidenceRowStore = new DrizzleEvidenceRowStore(
      getRuntimeDatabase
    )
  ) {}

  async create(record: EvidenceRecord): Promise<EvidenceRecord> {
    const rows = await this.store.insertEvidenceRecord(
      mapSourceToNewSourceRow(record.source),
      mapEvidenceItemToNewEvidenceItemRow(record.evidenceItem)
    );

    return mapEvidenceRows(rows);
  }

  async findById(id: string): Promise<EvidenceRecord | undefined> {
    const rows = await this.store.selectEvidenceById(id);

    return rows ? mapEvidenceRows(rows) : undefined;
  }

  async list(options: ListEvidenceOptions = {}): Promise<EvidenceRecord[]> {
    const rows = await this.store.selectEvidence(options);

    return rows.map(mapEvidenceRows);
  }
}

export function mapEvidenceRows(rows: EvidenceRows): EvidenceRecord {
  return evidenceRecordSchema.parse({
    source: mapSourceRow(rows.source),
    evidenceItem: mapEvidenceItemRow(rows.evidenceItem)
  });
}

export function mapSourceRow(row: SourceRow): Source {
  return sourceSchema.parse({
    id: row.id,
    canonicalName: row.canonicalName,
    baseUrl: row.baseUrl ?? undefined,
    sourceType: row.sourceType,
    notes: row.notes ?? undefined,
    createdAt: toIsoTimestamp(row.createdAt),
    updatedAt: toIsoTimestamp(row.updatedAt)
  });
}

export function mapEvidenceItemRow(row: EvidenceItemRow): EvidenceItem {
  return evidenceItemSchema.parse({
    id: row.id,
    sourceId: row.sourceId,
    canonicalUrl: row.canonicalUrl ?? undefined,
    title: row.title,
    author: row.author ?? undefined,
    publishedAt: nullableDateToIso(row.publishedAt),
    capturedAt: toIsoTimestamp(row.capturedAt),
    contentType: row.contentType ?? undefined,
    language: row.language ?? undefined,
    snapshotHash: row.snapshotHash ?? undefined,
    storageKey: row.storageKey ?? undefined,
    metadata:
      typeof row.metadataJsonb === "object" && row.metadataJsonb !== null
        ? (row.metadataJsonb as Record<string, unknown>)
        : {},
    createdAt: toIsoTimestamp(row.createdAt),
    updatedAt: toIsoTimestamp(row.updatedAt)
  });
}

export function mapSourceToNewSourceRow(source: Source): NewSourceRow {
  return {
    id: source.id,
    canonicalName: source.canonicalName,
    baseUrl: source.baseUrl ?? null,
    sourceType: source.sourceType,
    notes: source.notes ?? null,
    createdAt: toDate(source.createdAt),
    updatedAt: toDate(source.updatedAt)
  };
}

export function mapEvidenceItemToNewEvidenceItemRow(
  evidenceItem: EvidenceItem
): NewEvidenceItemRow {
  return {
    id: evidenceItem.id,
    sourceId: evidenceItem.sourceId,
    canonicalUrl: evidenceItem.canonicalUrl ?? null,
    title: evidenceItem.title,
    author: evidenceItem.author ?? null,
    publishedAt: nullableTimestampToDate(evidenceItem.publishedAt),
    capturedAt: toDate(evidenceItem.capturedAt),
    contentType: evidenceItem.contentType ?? null,
    language: evidenceItem.language ?? null,
    snapshotHash: evidenceItem.snapshotHash ?? null,
    storageKey: evidenceItem.storageKey ?? null,
    metadataJsonb: evidenceItem.metadata,
    createdAt: toDate(evidenceItem.createdAt),
    updatedAt: toDate(evidenceItem.updatedAt)
  };
}

async function selectReusableSource(
  tx: Parameters<Parameters<SignalTrackerDb["transaction"]>[0]>[0],
  source: NewSourceRow
): Promise<SourceRow | undefined> {
  if (source.baseUrl) {
    const [row] = await tx
      .select()
      .from(sources)
      .where(eq(sources.baseUrl, source.baseUrl))
      .limit(1);

    if (row) {
      return row;
    }
  }

  const [row] = await tx
    .select()
    .from(sources)
    .where(
      and(
        eq(sources.canonicalName, source.canonicalName),
        eq(sources.sourceType, source.sourceType)
      )
    )
    .limit(1);

  return row;
}

async function insertSource(
  tx: Parameters<Parameters<SignalTrackerDb["transaction"]>[0]>[0],
  source: NewSourceRow
): Promise<SourceRow> {
  const [sourceRow] = await tx.insert(sources).values(source).returning();

  if (!sourceRow) {
    throw new Error("Source insert did not return a row");
  }

  return sourceRow;
}

export function escapeIlikePattern(query: string): string {
  return query
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}
