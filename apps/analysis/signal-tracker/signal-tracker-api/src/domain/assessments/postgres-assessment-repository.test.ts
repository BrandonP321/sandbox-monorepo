import { describe, expect, it } from "vitest";

import type { AssessmentUpdate } from "@repo/signal-tracker-shared";

import type {
  EntryRow,
  NewEntryRow
} from "../entries/postgres-entry-repository";
import {
  mapAssessmentUpdateRows,
  PostgresAssessmentRepository,
  type AssessmentRowStore,
  type AssessmentUpdateRows,
  type EntryAssessmentRow,
  type NewEntryAssessmentRow
} from "./postgres-assessment-repository";

describe("PostgresAssessmentRepository", () => {
  it("maps assessment rows to the shared assessment update shape", () => {
    expect(
      mapAssessmentUpdateRows({
        entry: entryRowFixture,
        assessment: assessmentRowFixture
      })
    ).toEqual(assessmentUpdateFixture);
  });

  it("maps nullable assessment fields to omitted response fields", () => {
    expect(
      mapAssessmentUpdateRows({
        entry: entryRowFixture,
        assessment: {
          ...assessmentRowFixture,
          probabilityPct: null,
          resolutionCriteria: null,
          targetResolvesAt: null,
          previousAssessmentEntryId: null
        }
      })
    ).toEqual({
      ...assessmentUpdateFixture,
      probabilityPct: undefined,
      resolutionCriteria: undefined,
      targetResolvesAt: undefined,
      previousAssessmentEntryId: undefined
    });
  });

  it("persists a valid assessment update through the row store", async () => {
    const store = new FakeAssessmentRowStore();
    const repository = new PostgresAssessmentRepository(store);

    await expect(repository.create(assessmentUpdateFixture)).resolves.toEqual(
      assessmentUpdateFixture
    );
  });

  it("finds the latest active assessment update for a topic", async () => {
    const store = new FakeAssessmentRowStore();
    const repository = new PostgresAssessmentRepository(store);
    store.seed(assessmentUpdateFixture);
    store.seed({
      ...assessmentUpdateFixture,
      entry: {
        ...assessmentUpdateFixture.entry,
        id: "assessment-2",
        title: "Assessment update - 2026-04-26",
        sortAt: "2026-04-26T00:00:00.000Z",
        createdAt: "2026-04-26T01:00:00.000Z",
        updatedAt: "2026-04-26T01:00:00.000Z"
      }
    });
    store.seed({
      ...assessmentUpdateFixture,
      entry: {
        ...assessmentUpdateFixture.entry,
        id: "other-topic-assessment",
        topicId: "topic-2"
      }
    });
    store.seed({
      ...assessmentUpdateFixture,
      entry: {
        ...assessmentUpdateFixture.entry,
        id: "deleted-assessment",
        status: "deleted"
      }
    });

    await expect(
      repository.findLatestActiveByTopic("topic-1")
    ).resolves.toMatchObject({
      entry: {
        id: "assessment-2"
      }
    });
  });
});

const assessmentUpdateFixture: AssessmentUpdate = {
  entry: {
    id: "assessment-1",
    topicId: "topic-1",
    kind: "assessment",
    epistemicStatus: "forecast",
    title: "Assessment update - 2026-04-25",
    bodyMd: "Escalation risk remains limited.",
    sortAt: "2026-04-25T00:00:00.000Z",
    isApproximateDate: false,
    originType: "manual",
    status: "active",
    createdAt: "2026-04-25T01:00:00.000Z",
    updatedAt: "2026-04-25T01:00:00.000Z"
  },
  judgment: "Escalation risk remains limited.",
  confidenceLabel: "medium",
  probabilityPct: 35,
  assumptions: ["Diplomatic channels remain open"],
  indicators: ["Watch for evacuation orders"],
  resolutionCriteria: "Direct military action occurs.",
  targetResolvesAt: "2026-05-25T00:00:00.000Z",
  previousAssessmentEntryId: "assessment-previous"
};

const entryRowFixture: EntryRow = {
  id: "assessment-1",
  topicId: "topic-1",
  kind: "assessment",
  epistemicStatus: "forecast",
  title: "Assessment update - 2026-04-25",
  bodyMd: "Escalation risk remains limited.",
  sortAt: new Date("2026-04-25T00:00:00.000Z"),
  isApproximateDate: false,
  originType: "manual",
  status: "active",
  createdAt: new Date("2026-04-25T01:00:00.000Z"),
  updatedAt: new Date("2026-04-25T01:00:00.000Z"),
  archivedAt: null,
  deletedAt: null
};

const assessmentRowFixture: EntryAssessmentRow = {
  entryId: "assessment-1",
  judgment: "Escalation risk remains limited.",
  confidenceLabel: "medium",
  probabilityPct: 35,
  assumptionsJson: ["Diplomatic channels remain open"],
  indicatorsJson: ["Watch for evacuation orders"],
  resolutionCriteria: "Direct military action occurs.",
  targetResolvesAt: new Date("2026-05-25T00:00:00.000Z"),
  previousAssessmentEntryId: "assessment-previous"
};

class FakeAssessmentRowStore implements AssessmentRowStore {
  private readonly rows = new Map<string, AssessmentUpdateRows>();

  async insertAssessmentUpdate(
    entry: NewEntryRow,
    assessment: NewEntryAssessmentRow
  ): Promise<AssessmentUpdateRows> {
    const rows: AssessmentUpdateRows = {
      entry: {
        id: entry.id,
        topicId: entry.topicId,
        kind: entry.kind,
        epistemicStatus: entry.epistemicStatus,
        title: entry.title,
        bodyMd: entry.bodyMd,
        sortAt: entry.sortAt,
        isApproximateDate: entry.isApproximateDate ?? false,
        originType: entry.originType ?? "manual",
        status: entry.status ?? "active",
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        archivedAt: entry.archivedAt ? new Date(entry.archivedAt) : null,
        deletedAt: entry.deletedAt ? new Date(entry.deletedAt) : null
      },
      assessment: {
        entryId: assessment.entryId,
        judgment: assessment.judgment,
        confidenceLabel: assessment.confidenceLabel,
        probabilityPct: assessment.probabilityPct ?? null,
        assumptionsJson: assessment.assumptionsJson,
        indicatorsJson: assessment.indicatorsJson,
        resolutionCriteria: assessment.resolutionCriteria ?? null,
        targetResolvesAt: assessment.targetResolvesAt
          ? new Date(assessment.targetResolvesAt)
          : null,
        previousAssessmentEntryId: assessment.previousAssessmentEntryId ?? null
      }
    };

    this.rows.set(rows.entry.id, rows);

    return rows;
  }

  async selectLatestActiveAssessmentByTopic(
    topicId: string
  ): Promise<AssessmentUpdateRows | undefined> {
    return Array.from(this.rows.values())
      .filter(
        (rows) =>
          rows.entry.topicId === topicId &&
          rows.entry.kind === "assessment" &&
          rows.entry.status === "active"
      )
      .sort(compareAssessmentRowsForList)[0];
  }

  seed(assessmentUpdate: AssessmentUpdate): void {
    this.rows.set(assessmentUpdate.entry.id, {
      entry: {
        id: assessmentUpdate.entry.id,
        topicId: assessmentUpdate.entry.topicId,
        kind: assessmentUpdate.entry.kind,
        epistemicStatus: assessmentUpdate.entry.epistemicStatus,
        title: assessmentUpdate.entry.title,
        bodyMd: assessmentUpdate.entry.bodyMd,
        sortAt: new Date(assessmentUpdate.entry.sortAt),
        isApproximateDate: assessmentUpdate.entry.isApproximateDate,
        originType: assessmentUpdate.entry.originType,
        status: assessmentUpdate.entry.status,
        createdAt: new Date(assessmentUpdate.entry.createdAt),
        updatedAt: new Date(assessmentUpdate.entry.updatedAt),
        archivedAt: assessmentUpdate.entry.archivedAt
          ? new Date(assessmentUpdate.entry.archivedAt)
          : null,
        deletedAt: assessmentUpdate.entry.deletedAt
          ? new Date(assessmentUpdate.entry.deletedAt)
          : null
      },
      assessment: {
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
      }
    });
  }
}

function compareAssessmentRowsForList(
  left: AssessmentUpdateRows,
  right: AssessmentUpdateRows
): number {
  const sortAtComparison =
    getTime(right.entry.sortAt) - getTime(left.entry.sortAt);

  if (sortAtComparison !== 0) {
    return sortAtComparison;
  }

  const createdAtComparison =
    getTime(right.entry.createdAt) - getTime(left.entry.createdAt);

  if (createdAtComparison !== 0) {
    return createdAtComparison;
  }

  return left.entry.id.localeCompare(right.entry.id);
}

function getTime(value: Date | string): number {
  return new Date(value).getTime();
}
