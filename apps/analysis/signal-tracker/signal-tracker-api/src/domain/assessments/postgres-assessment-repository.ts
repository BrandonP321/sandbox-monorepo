import { and, asc, desc, eq } from "drizzle-orm";

import {
  assessmentUpdateSchema,
  type AssessmentUpdate,
  type Entry
} from "@repo/signal-tracker-shared";

import { getRuntimeDatabase, type SignalTrackerDb } from "../../db/client";
import { entries, entryAssessments } from "../../db/schema";
import {
  mapEntryRow,
  type EntryRow,
  type NewEntryRow
} from "../entries/postgres-entry-repository";
import type { AssessmentRepository } from "./assessment-repository";

export type EntryAssessmentRow = typeof entryAssessments.$inferSelect;
export type NewEntryAssessmentRow = typeof entryAssessments.$inferInsert;
export type AssessmentUpdateRows = {
  entry: EntryRow;
  assessment: EntryAssessmentRow;
};

export type AssessmentRowStore = {
  insertAssessmentUpdate(
    entry: NewEntryRow,
    assessment: NewEntryAssessmentRow
  ): Promise<AssessmentUpdateRows>;
  selectLatestActiveAssessmentByTopic(
    topicId: string
  ): Promise<AssessmentUpdateRows | undefined>;
};

export class DrizzleAssessmentRowStore implements AssessmentRowStore {
  constructor(private readonly getDatabase: () => SignalTrackerDb) {}

  async insertAssessmentUpdate(
    entry: NewEntryRow,
    assessment: NewEntryAssessmentRow
  ): Promise<AssessmentUpdateRows> {
    return await this.getDatabase().transaction(async (tx) => {
      const [entryRow] = await tx.insert(entries).values(entry).returning();

      if (!entryRow) {
        throw new Error("Assessment entry insert did not return a row");
      }

      const [assessmentRow] = await tx
        .insert(entryAssessments)
        .values(assessment)
        .returning();

      if (!assessmentRow) {
        throw new Error("Assessment subtype insert did not return a row");
      }

      return { entry: entryRow, assessment: assessmentRow };
    });
  }

  async selectLatestActiveAssessmentByTopic(
    topicId: string
  ): Promise<AssessmentUpdateRows | undefined> {
    const [row] = await this.getDatabase()
      .select({
        entry: entries,
        assessment: entryAssessments
      })
      .from(entryAssessments)
      .innerJoin(entries, eq(entryAssessments.entryId, entries.id))
      .where(
        and(
          eq(entries.topicId, topicId),
          eq(entries.kind, "assessment"),
          eq(entries.status, "active")
        )
      )
      .orderBy(desc(entries.sortAt), desc(entries.createdAt), asc(entries.id))
      .limit(1);

    return row;
  }
}

export class PostgresAssessmentRepository implements AssessmentRepository {
  constructor(
    private readonly store: AssessmentRowStore = new DrizzleAssessmentRowStore(
      getRuntimeDatabase
    )
  ) {}

  async create(assessmentUpdate: AssessmentUpdate): Promise<AssessmentUpdate> {
    const rows = await this.store.insertAssessmentUpdate(
      mapEntryToRow(assessmentUpdate.entry),
      mapAssessmentToRow(assessmentUpdate)
    );

    return mapAssessmentUpdateRows(rows);
  }

  async findLatestActiveByTopic(
    topicId: string
  ): Promise<AssessmentUpdate | undefined> {
    const rows = await this.store.selectLatestActiveAssessmentByTopic(topicId);

    return rows ? mapAssessmentUpdateRows(rows) : undefined;
  }
}

export function mapAssessmentUpdateRows(
  rows: AssessmentUpdateRows
): AssessmentUpdate {
  return assessmentUpdateSchema.parse({
    entry: mapEntryRow(rows.entry),
    judgment: rows.assessment.judgment,
    confidenceLabel: rows.assessment.confidenceLabel,
    probabilityPct: rows.assessment.probabilityPct ?? undefined,
    assumptions: rows.assessment.assumptionsJson,
    indicators: rows.assessment.indicatorsJson,
    resolutionCriteria: rows.assessment.resolutionCriteria ?? undefined,
    targetResolvesAt: rows.assessment.targetResolvesAt
      ? toIsoTimestamp(rows.assessment.targetResolvesAt)
      : undefined,
    previousAssessmentEntryId:
      rows.assessment.previousAssessmentEntryId ?? undefined
  });
}

function mapEntryToRow(entry: Entry): NewEntryRow {
  return {
    id: entry.id,
    topicId: entry.topicId,
    kind: entry.kind,
    epistemicStatus: entry.epistemicStatus,
    title: entry.title,
    bodyMd: entry.bodyMd,
    sortAt: new Date(entry.sortAt),
    isApproximateDate: entry.isApproximateDate,
    originType: entry.originType,
    status: entry.status,
    createdAt: new Date(entry.createdAt),
    updatedAt: new Date(entry.updatedAt),
    archivedAt: entry.archivedAt ? new Date(entry.archivedAt) : null,
    deletedAt: entry.deletedAt ? new Date(entry.deletedAt) : null
  };
}

function mapAssessmentToRow(
  assessmentUpdate: AssessmentUpdate
): NewEntryAssessmentRow {
  return {
    entryId: assessmentUpdate.entry.id,
    judgment: assessmentUpdate.judgment,
    confidenceLabel: assessmentUpdate.confidenceLabel,
    probabilityPct: assessmentUpdate.probabilityPct ?? null,
    assumptionsJson: assessmentUpdate.assumptions,
    indicatorsJson: assessmentUpdate.indicators,
    resolutionCriteria: assessmentUpdate.resolutionCriteria ?? null,
    targetResolvesAt: assessmentUpdate.targetResolvesAt
      ? new Date(assessmentUpdate.targetResolvesAt)
      : null,
    previousAssessmentEntryId:
      assessmentUpdate.previousAssessmentEntryId ?? null
  };
}

function toIsoTimestamp(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}
