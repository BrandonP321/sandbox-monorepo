import type {
  AssessmentUpdate,
  Entry,
  Topic
} from "@repo/signal-tracker-shared";

import type {
  AssessmentUpdateRows,
  EntryAssessmentRow,
  NewEntryAssessmentRow
} from "./assessments/postgres-assessment-repository";
import type {
  EntryRow,
  NewEntryRow
} from "./entries/postgres-entry-repository";
import { nullableTimestampToDate, toDate } from "./persistence/timestamps";
import type { NewTopicRow, TopicRow } from "./topics/postgres-topic-repository";

type AssessmentUpdateFixtureOverrides = Partial<
  Omit<AssessmentUpdate, "entry">
> & {
  entry?: Partial<Entry>;
};

export function buildTopicFixture(overrides: Partial<Topic> = {}): Topic {
  return {
    id: "topic-1",
    title: "Iran strike risk",
    framingQuestion: "Will tensions escalate?",
    scopeNote: "Track military and diplomatic signals.",
    reviewCadence: "weekly",
    status: "active",
    createdAt: "2026-04-25T00:00:00.000Z",
    updatedAt: "2026-04-25T00:00:00.000Z",
    ...overrides
  };
}

export function buildTopicRowFixture(
  overrides: Partial<TopicRow> = {}
): TopicRow {
  return {
    id: "topic-1",
    title: "Iran strike risk",
    framingQuestion: "Will tensions escalate?",
    scopeNote: null,
    reviewCadence: "weekly",
    status: "active",
    createdAt: toDate("2026-04-25T00:00:00.000Z"),
    updatedAt: toDate("2026-04-25T00:00:00.000Z"),
    archivedAt: null,
    ...overrides
  };
}

export function topicToRow(topic: Topic): TopicRow {
  return {
    id: topic.id,
    title: topic.title,
    framingQuestion: topic.framingQuestion,
    scopeNote: topic.scopeNote ?? null,
    reviewCadence: topic.reviewCadence,
    status: topic.status,
    createdAt: toDate(topic.createdAt),
    updatedAt: toDate(topic.updatedAt),
    archivedAt: nullableTimestampToDate(topic.archivedAt)
  };
}

export function newTopicRowToRow(topic: NewTopicRow): TopicRow {
  return {
    id: topic.id,
    title: topic.title,
    framingQuestion: topic.framingQuestion,
    scopeNote: topic.scopeNote ?? null,
    reviewCadence: topic.reviewCadence,
    status: topic.status,
    createdAt: topic.createdAt,
    updatedAt: topic.updatedAt,
    archivedAt: nullableTimestampToDate(topic.archivedAt)
  };
}

export function buildEntryFixture(overrides: Partial<Entry> = {}): Entry {
  return {
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
    ...overrides
  };
}

export function buildEntryRowFixture(
  overrides: Partial<EntryRow> = {}
): EntryRow {
  return {
    id: "entry-1",
    topicId: "topic-1",
    kind: "event",
    epistemicStatus: "reported",
    title: "Court grants injunction",
    bodyMd: "A federal court granted an injunction.",
    sortAt: toDate("2026-04-25T00:00:00.000Z"),
    isApproximateDate: false,
    originType: "manual",
    status: "active",
    createdAt: toDate("2026-04-25T01:00:00.000Z"),
    updatedAt: toDate("2026-04-25T01:00:00.000Z"),
    archivedAt: null,
    deletedAt: null,
    ...overrides
  };
}

export function entryToRow(entry: Entry): EntryRow {
  return {
    id: entry.id,
    topicId: entry.topicId,
    kind: entry.kind,
    epistemicStatus: entry.epistemicStatus,
    title: entry.title,
    bodyMd: entry.bodyMd,
    sortAt: toDate(entry.sortAt),
    isApproximateDate: entry.isApproximateDate,
    originType: entry.originType,
    status: entry.status,
    createdAt: toDate(entry.createdAt),
    updatedAt: toDate(entry.updatedAt),
    archivedAt: nullableTimestampToDate(entry.archivedAt),
    deletedAt: nullableTimestampToDate(entry.deletedAt)
  };
}

export function newEntryRowToRow(entry: NewEntryRow): EntryRow {
  return {
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
    archivedAt: nullableTimestampToDate(entry.archivedAt),
    deletedAt: nullableTimestampToDate(entry.deletedAt)
  };
}

export function buildAssessmentUpdateFixture(
  overrides: AssessmentUpdateFixtureOverrides = {}
): AssessmentUpdate {
  const { entry: entryOverrides, ...assessmentOverrides } = overrides;

  return {
    entry: buildEntryFixture({
      id: "assessment-1",
      kind: "assessment",
      epistemicStatus: "forecast",
      title: "Assessment update - 2026-04-25",
      bodyMd: "Escalation risk remains limited.",
      ...entryOverrides
    }),
    judgment: "Escalation risk remains limited.",
    confidenceLabel: "medium",
    probabilityPct: 35,
    assumptions: ["Diplomatic channels remain open"],
    indicators: ["Watch for evacuation orders"],
    resolutionCriteria: "Direct military action occurs.",
    targetResolvesAt: "2026-05-25T00:00:00.000Z",
    previousAssessmentEntryId: "assessment-previous",
    ...assessmentOverrides
  };
}

export function buildEntryAssessmentRowFixture(
  overrides: Partial<EntryAssessmentRow> = {}
): EntryAssessmentRow {
  return {
    entryId: "assessment-1",
    judgment: "Escalation risk remains limited.",
    confidenceLabel: "medium",
    probabilityPct: 35,
    assumptionsJson: ["Diplomatic channels remain open"],
    indicatorsJson: ["Watch for evacuation orders"],
    resolutionCriteria: "Direct military action occurs.",
    targetResolvesAt: toDate("2026-05-25T00:00:00.000Z"),
    previousAssessmentEntryId: "assessment-previous",
    ...overrides
  };
}

export function assessmentUpdateToRows(
  assessmentUpdate: AssessmentUpdate
): AssessmentUpdateRows {
  return {
    entry: entryToRow(assessmentUpdate.entry),
    assessment: {
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
    }
  };
}

export function newAssessmentRowsToRows(
  entry: NewEntryRow,
  assessment: NewEntryAssessmentRow
): AssessmentUpdateRows {
  return {
    entry: newEntryRowToRow(entry),
    assessment: {
      entryId: assessment.entryId,
      judgment: assessment.judgment,
      confidenceLabel: assessment.confidenceLabel,
      probabilityPct: assessment.probabilityPct ?? null,
      assumptionsJson: assessment.assumptionsJson,
      indicatorsJson: assessment.indicatorsJson,
      resolutionCriteria: assessment.resolutionCriteria ?? null,
      targetResolvesAt: nullableTimestampToDate(assessment.targetResolvesAt),
      previousAssessmentEntryId: assessment.previousAssessmentEntryId ?? null
    }
  };
}
