import { asc, desc, eq } from "drizzle-orm";

import {
  evidenceAnchorSchema,
  type EvidenceAnchor
} from "@repo/signal-tracker-shared";

import { getRuntimeDatabase, type SignalTrackerDb } from "../../db/client";
import { evidenceAnchors } from "../../db/schema";
import { toDate, toIsoTimestamp } from "../persistence/timestamps";
import type { EvidenceAnchorRepository } from "./evidence-anchor-repository";

export type EvidenceAnchorRow = typeof evidenceAnchors.$inferSelect;
export type NewEvidenceAnchorRow = typeof evidenceAnchors.$inferInsert;

export type EvidenceAnchorRowStore = {
  insertEvidenceAnchor(
    anchor: NewEvidenceAnchorRow
  ): Promise<EvidenceAnchorRow>;
  selectEvidenceAnchorById(id: string): Promise<EvidenceAnchorRow | undefined>;
  selectEvidenceAnchorsByEvidenceItemId(
    evidenceItemId: string
  ): Promise<EvidenceAnchorRow[]>;
};

export class DrizzleEvidenceAnchorRowStore implements EvidenceAnchorRowStore {
  constructor(private readonly getDatabase: () => SignalTrackerDb) {}

  async insertEvidenceAnchor(
    anchor: NewEvidenceAnchorRow
  ): Promise<EvidenceAnchorRow> {
    const [row] = await this.getDatabase()
      .insert(evidenceAnchors)
      .values(anchor)
      .returning();

    if (!row) {
      throw new Error("Evidence anchor insert did not return a row");
    }

    return row;
  }

  async selectEvidenceAnchorById(
    id: string
  ): Promise<EvidenceAnchorRow | undefined> {
    const [row] = await this.getDatabase()
      .select()
      .from(evidenceAnchors)
      .where(eq(evidenceAnchors.id, id))
      .limit(1);

    return row;
  }

  async selectEvidenceAnchorsByEvidenceItemId(
    evidenceItemId: string
  ): Promise<EvidenceAnchorRow[]> {
    return await this.getDatabase()
      .select()
      .from(evidenceAnchors)
      .where(eq(evidenceAnchors.evidenceItemId, evidenceItemId))
      .orderBy(desc(evidenceAnchors.createdAt), asc(evidenceAnchors.id));
  }
}

export class PostgresEvidenceAnchorRepository implements EvidenceAnchorRepository {
  constructor(
    private readonly store: EvidenceAnchorRowStore = new DrizzleEvidenceAnchorRowStore(
      getRuntimeDatabase
    )
  ) {}

  async create(anchor: EvidenceAnchor): Promise<EvidenceAnchor> {
    const row = await this.store.insertEvidenceAnchor(
      mapEvidenceAnchorToNewEvidenceAnchorRow(anchor)
    );

    return mapEvidenceAnchorRow(row);
  }

  async findById(id: string): Promise<EvidenceAnchor | undefined> {
    const row = await this.store.selectEvidenceAnchorById(id);

    return row ? mapEvidenceAnchorRow(row) : undefined;
  }

  async listByEvidenceItemId(
    evidenceItemId: string
  ): Promise<EvidenceAnchor[]> {
    const rows =
      await this.store.selectEvidenceAnchorsByEvidenceItemId(evidenceItemId);

    return rows.map(mapEvidenceAnchorRow);
  }
}

export function mapEvidenceAnchorRow(row: EvidenceAnchorRow): EvidenceAnchor {
  return evidenceAnchorSchema.parse({
    id: row.id,
    evidenceItemId: row.evidenceItemId,
    quoteText: row.quoteText ?? undefined,
    prefix: row.prefix ?? undefined,
    suffix: row.suffix ?? undefined,
    pageLabel: row.pageLabel ?? undefined,
    startPos: row.startPos ?? undefined,
    endPos: row.endPos ?? undefined,
    locator:
      typeof row.locatorJsonb === "object" && row.locatorJsonb !== null
        ? (row.locatorJsonb as Record<string, unknown>)
        : {},
    createdAt: toIsoTimestamp(row.createdAt),
    updatedAt: toIsoTimestamp(row.updatedAt)
  });
}

export function mapEvidenceAnchorToNewEvidenceAnchorRow(
  anchor: EvidenceAnchor
): NewEvidenceAnchorRow {
  return {
    id: anchor.id,
    evidenceItemId: anchor.evidenceItemId,
    quoteText: anchor.quoteText ?? null,
    prefix: anchor.prefix ?? null,
    suffix: anchor.suffix ?? null,
    pageLabel: anchor.pageLabel ?? null,
    startPos: anchor.startPos ?? null,
    endPos: anchor.endPos ?? null,
    locatorJsonb: anchor.locator,
    createdAt: toDate(anchor.createdAt),
    updatedAt: toDate(anchor.updatedAt)
  };
}
