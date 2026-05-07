import { and, asc, desc, eq } from "drizzle-orm";

import {
  assessmentUpdateSchema,
  type AssessmentUpdate
} from "@repo/signal-tracker-shared";

import { getRuntimeDatabase, type SignalTrackerDb } from "../../db/client";
import { entries, entryAssessments } from "../../db/schema";
import {
  mapEntryRow,
  mapEntryToNewEntryRow
} from "../entries/entry-row-mapping";
import {
  type EntryRow,
  type NewEntryRow
} from "../entries/postgres-entry-repository";
import {
  nullableDateToIso,
  nullableTimestampToDate
} from "../persistence/timestamps";
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
  selectActiveAssessmentsByTopic(
    topicId: string
  ): Promise<AssessmentUpdateRows[]>;
};

export class DrizzleAssessmentRowStore implements AssessmentRowStore {
  constructor(private readonly getDatabase: () => SignalTrackerDb) {}

  async insertAssessmentUpdate(
    entry: NewEntryRow,
    assessment: NewEntryAssessmentRow
  ): Promise<AssessmentUpdateRows> {
    return await runInTransactionOrDirect(this.getDatabase(), async (tx) => {
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

  async selectActiveAssessmentsByTopic(
    topicId: string
  ): Promise<AssessmentUpdateRows[]> {
    return await this.getDatabase()
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
      .orderBy(desc(entries.sortAt), desc(entries.createdAt), asc(entries.id));
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
      mapEntryToNewEntryRow(assessmentUpdate.entry),
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

  async listActiveByTopic(topicId: string): Promise<AssessmentUpdate[]> {
    const rows = await this.store.selectActiveAssessmentsByTopic(topicId);

    return rows.map(mapAssessmentUpdateRows);
  }
}

type SignalTrackerTransaction = Parameters<
  Parameters<SignalTrackerDb["transaction"]>[0]
>[0];

// TODO: Might not be needed given assumption we will always connect to Aurora DB.  Run analysis with documented assumptions.
async function runInTransactionOrDirect<T>(
  database: SignalTrackerDb,
  operation: (tx: SignalTrackerTransaction) => Promise<T>
): Promise<T> {
  if (hasTransaction(database)) {
    return await database.transaction(operation);
  }

  return await operation(database as unknown as SignalTrackerTransaction);
}

function hasTransaction(
  database: SignalTrackerDb
): database is SignalTrackerDb & {
  transaction: SignalTrackerDb["transaction"];
} {
  return typeof database.transaction === "function";
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
    targetResolvesAt: nullableDateToIso(rows.assessment.targetResolvesAt),
    previousAssessmentEntryId:
      rows.assessment.previousAssessmentEntryId ?? undefined
  });
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
    targetResolvesAt: nullableTimestampToDate(
      assessmentUpdate.targetResolvesAt
    ),
    previousAssessmentEntryId:
      assessmentUpdate.previousAssessmentEntryId ?? null
  };
}
