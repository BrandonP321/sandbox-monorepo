import type {
  AssessmentUpdate,
  EvidenceAnchor,
  EvidenceItem,
  EvidenceRecord,
  EntryCitation,
  Entry,
  Source,
  Topic
} from "@repo/signal-tracker-shared";

import type {
  AssessmentUpdateRows,
  NewEntryAssessmentRow
} from "./assessments/postgres-assessment-repository";
import type {
  EntryCitationRow,
  NewEntryCitationRow
} from "./citations/postgres-entry-citation-repository";
import type {
  EntryRow,
  NewEntryRow
} from "./entries/postgres-entry-repository";
import type {
  EvidenceAnchorRow,
  NewEvidenceAnchorRow
} from "./evidence/postgres-evidence-anchor-repository";
import type {
  EvidenceItemRow,
  EvidenceRows,
  NewEvidenceItemRow,
  NewSourceRow,
  SourceRow
} from "./evidence/postgres-evidence-repository";
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

export function buildSourceFixture(overrides: Partial<Source> = {}): Source {
  return {
    id: "source-1",
    canonicalName: "Reuters",
    baseUrl: "https://www.reuters.com",
    sourceType: "news",
    notes: "Wire service",
    createdAt: "2026-04-25T00:00:00.000Z",
    updatedAt: "2026-04-25T00:00:00.000Z",
    ...overrides
  };
}

export function buildEvidenceItemFixture(
  overrides: Partial<EvidenceItem> = {}
): EvidenceItem {
  return {
    id: "evidence-1",
    sourceId: "source-1",
    canonicalUrl: "https://www.reuters.com/world/example",
    title: "Court grants injunction",
    author: "Jane Reporter",
    publishedAt: "2026-04-24T00:00:00.000Z",
    capturedAt: "2026-04-25T00:00:00.000Z",
    contentType: "text/html",
    language: "en",
    snapshotHash: "sha256:abc123",
    storageKey: "evidence/evidence-1.html",
    metadata: { section: "World" },
    createdAt: "2026-04-25T00:00:00.000Z",
    updatedAt: "2026-04-25T00:00:00.000Z",
    ...overrides
  };
}

export function buildEvidenceRecordFixture(
  overrides: Partial<EvidenceRecord> = {}
): EvidenceRecord {
  const source = overrides.source ?? buildSourceFixture();
  const evidenceItem =
    overrides.evidenceItem ?? buildEvidenceItemFixture({ sourceId: source.id });

  return { source, evidenceItem };
}

export function buildEvidenceAnchorFixture(
  overrides: Partial<EvidenceAnchor> = {}
): EvidenceAnchor {
  return {
    id: "anchor-1",
    evidenceItemId: "evidence-1",
    quoteText: "A federal court granted an injunction.",
    prefix: "Earlier context.",
    suffix: "Later context.",
    locator: {},
    createdAt: "2026-04-25T00:00:00.000Z",
    updatedAt: "2026-04-25T00:00:00.000Z",
    ...overrides
  };
}

export function buildEntryCitationFixture(
  overrides: Partial<EntryCitation> = {}
): EntryCitation {
  return {
    id: "citation-1",
    entryId: "entry-1",
    evidenceItemId: "evidence-1",
    relationType: "supports",
    note: "Supports the event wording.",
    createdAt: "2026-04-25T00:00:00.000Z",
    ...overrides
  };
}

export function sourceToRow(source: Source): SourceRow {
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

export function evidenceItemToRow(evidenceItem: EvidenceItem): EvidenceItemRow {
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

export function evidenceRecordToRows(
  evidenceRecord: EvidenceRecord
): EvidenceRows {
  return {
    source: sourceToRow(evidenceRecord.source),
    evidenceItem: evidenceItemToRow(evidenceRecord.evidenceItem)
  };
}

export function newEvidenceRowsToRows(
  source: NewSourceRow,
  evidenceItem: NewEvidenceItemRow
): EvidenceRows {
  const sourceRow: SourceRow = {
    id: source.id,
    canonicalName: source.canonicalName,
    baseUrl: source.baseUrl ?? null,
    sourceType: source.sourceType,
    notes: source.notes ?? null,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt
  };
  const evidenceItemRow: EvidenceItemRow = {
    id: evidenceItem.id,
    sourceId: evidenceItem.sourceId,
    canonicalUrl: evidenceItem.canonicalUrl ?? null,
    title: evidenceItem.title,
    author: evidenceItem.author ?? null,
    publishedAt: nullableTimestampToDate(evidenceItem.publishedAt),
    capturedAt: evidenceItem.capturedAt,
    contentType: evidenceItem.contentType ?? null,
    language: evidenceItem.language ?? null,
    snapshotHash: evidenceItem.snapshotHash ?? null,
    storageKey: evidenceItem.storageKey ?? null,
    metadataJsonb: evidenceItem.metadataJsonb ?? {},
    createdAt: evidenceItem.createdAt,
    updatedAt: evidenceItem.updatedAt
  };

  return { source: sourceRow, evidenceItem: evidenceItemRow };
}

export function evidenceAnchorToRow(anchor: EvidenceAnchor): EvidenceAnchorRow {
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

export function newEvidenceAnchorRowToRow(
  anchor: NewEvidenceAnchorRow
): EvidenceAnchorRow {
  return {
    id: anchor.id,
    evidenceItemId: anchor.evidenceItemId,
    quoteText: anchor.quoteText ?? null,
    prefix: anchor.prefix ?? null,
    suffix: anchor.suffix ?? null,
    pageLabel: anchor.pageLabel ?? null,
    startPos: anchor.startPos ?? null,
    endPos: anchor.endPos ?? null,
    locatorJsonb: anchor.locatorJsonb ?? {},
    createdAt: anchor.createdAt,
    updatedAt: anchor.updatedAt
  };
}

export function entryCitationToRow(citation: EntryCitation): EntryCitationRow {
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

export function newEntryCitationRowToRow(
  citation: NewEntryCitationRow
): EntryCitationRow {
  return {
    id: citation.id,
    entryId: citation.entryId,
    evidenceItemId: citation.evidenceItemId,
    evidenceAnchorId: citation.evidenceAnchorId ?? null,
    relationType: citation.relationType ?? "supports",
    note: citation.note ?? null,
    createdAt: citation.createdAt
  };
}
