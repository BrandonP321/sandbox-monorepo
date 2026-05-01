import type {
  AssessmentUpdate,
  EvidenceAnchor,
  EvidenceRecord,
  Entry,
  Topic
} from "@repo/signal-tracker-shared";

import type {
  AssessmentRowStore,
  AssessmentUpdateRows,
  NewEntryAssessmentRow
} from "./assessments/postgres-assessment-repository";
import type { ListEntriesByTopicOptions } from "./entries/entry-repository";
import type {
  EntryRow,
  EntryRowStore,
  NewEntryRow
} from "./entries/postgres-entry-repository";
import type {
  EvidenceAnchorRow,
  EvidenceAnchorRowStore,
  NewEvidenceAnchorRow
} from "./evidence/postgres-evidence-anchor-repository";
import type {
  EvidenceRows,
  EvidenceRowStore,
  NewEvidenceItemRow,
  NewSourceRow
} from "./evidence/postgres-evidence-repository";
import {
  assessmentUpdateToRows,
  evidenceAnchorToRow,
  evidenceRecordToRows,
  entryToRow,
  newEvidenceAnchorRowToRow,
  newEvidenceRowsToRows,
  newAssessmentRowsToRows,
  newEntryRowToRow,
  newTopicRowToRow,
  topicToRow
} from "./test-fixtures";
import type { ListTopicsOptions } from "./topics/topic-repository";
import type {
  NewTopicRow,
  TopicRow,
  TopicRowStore
} from "./topics/postgres-topic-repository";

export class FakeTopicRowStore implements TopicRowStore {
  private readonly topics = new Map<string, TopicRow>();

  async insertTopic(topic: NewTopicRow): Promise<TopicRow> {
    const row = newTopicRowToRow(topic);

    this.topics.set(row.id, row);

    return row;
  }

  async selectTopicById(id: string): Promise<TopicRow | undefined> {
    return this.topics.get(id);
  }

  async selectTopics(options: ListTopicsOptions = {}): Promise<TopicRow[]> {
    const query = options.query?.toLocaleLowerCase();

    return Array.from(this.topics.values())
      .filter((row) => row.status === "active")
      .filter((row) => {
        if (!query) {
          return true;
        }

        return [row.title, row.framingQuestion, row.scopeNote ?? ""].some(
          (value) => value.toLocaleLowerCase().includes(query)
        );
      })
      .sort(compareTopicRowsForList);
  }

  async updateTopic(
    id: string,
    updates: Partial<NewTopicRow>
  ): Promise<TopicRow | undefined> {
    const existingRow = await this.selectTopicById(id);

    if (!existingRow) {
      return undefined;
    }

    const updatedRow: TopicRow = {
      ...existingRow,
      ...updates
    };

    this.topics.set(id, updatedRow);

    return updatedRow;
  }

  async deleteTopic(id: string): Promise<TopicRow | undefined> {
    const existingRow = await this.selectTopicById(id);

    if (!existingRow) {
      return undefined;
    }

    this.topics.delete(id);

    return existingRow;
  }

  seed(topic: Topic): void;
  seed(row: TopicRow): void;
  seed(topicOrRow: Topic | TopicRow): void {
    const row = isTopicRow(topicOrRow) ? topicOrRow : topicToRow(topicOrRow);

    this.topics.set(row.id, row);
  }
}

export class FakeEntryRowStore implements EntryRowStore {
  private readonly entries = new Map<string, EntryRow>();

  async insertEntry(entry: NewEntryRow): Promise<EntryRow> {
    const row = newEntryRowToRow(entry);

    this.entries.set(row.id, row);

    return row;
  }

  async selectEntryById(id: string): Promise<EntryRow | undefined> {
    return this.entries.get(id);
  }

  async selectEntriesByTopic(
    topicId: string,
    options: ListEntriesByTopicOptions = {}
  ): Promise<EntryRow[]> {
    return Array.from(this.entries.values())
      .filter((row) => row.topicId === topicId)
      .filter((row) => {
        if (row.status === "archived") {
          return options.includeArchived === true;
        }

        if (row.status === "deleted") {
          return options.includeDeleted === true;
        }

        return row.status === "active";
      })
      .sort(compareEntryRowsForList);
  }

  async updateEntry(
    id: string,
    updates: Partial<NewEntryRow>
  ): Promise<EntryRow | undefined> {
    const existingRow = this.entries.get(id);

    if (!existingRow) {
      return undefined;
    }

    const updatedRow: EntryRow = {
      ...existingRow,
      ...updates
    };
    this.entries.set(id, updatedRow);

    return updatedRow;
  }

  seed(entry: Entry): void;
  seed(row: EntryRow): void;
  seed(entryOrRow: Entry | EntryRow): void {
    const row = isEntryRow(entryOrRow) ? entryOrRow : entryToRow(entryOrRow);

    this.entries.set(row.id, row);
  }
}

export class FakeAssessmentRowStore implements AssessmentRowStore {
  private readonly rows = new Map<string, AssessmentUpdateRows>();

  async insertAssessmentUpdate(
    entry: NewEntryRow,
    assessment: NewEntryAssessmentRow
  ): Promise<AssessmentUpdateRows> {
    const rows = newAssessmentRowsToRows(entry, assessment);

    this.rows.set(rows.entry.id, rows);

    return rows;
  }

  async selectLatestActiveAssessmentByTopic(
    topicId: string
  ): Promise<AssessmentUpdateRows | undefined> {
    return this.selectActiveAssessmentsByTopic(topicId).then((rows) => rows[0]);
  }

  async selectActiveAssessmentsByTopic(
    topicId: string
  ): Promise<AssessmentUpdateRows[]> {
    return Array.from(this.rows.values())
      .filter(
        (rows) =>
          rows.entry.topicId === topicId &&
          rows.entry.kind === "assessment" &&
          rows.entry.status === "active"
      )
      .sort(compareAssessmentRowsForList);
  }

  seed(assessmentUpdate: AssessmentUpdate): void;
  seed(rows: AssessmentUpdateRows): void;
  seed(assessmentUpdateOrRows: AssessmentUpdate | AssessmentUpdateRows): void {
    const rows = isAssessmentUpdateRows(assessmentUpdateOrRows)
      ? assessmentUpdateOrRows
      : assessmentUpdateToRows(assessmentUpdateOrRows);

    this.rows.set(rows.entry.id, rows);
  }
}

export class FakeEvidenceRowStore implements EvidenceRowStore {
  private readonly rows = new Map<string, EvidenceRows>();

  async insertEvidenceRecord(
    source: NewSourceRow,
    evidenceItem: NewEvidenceItemRow
  ): Promise<EvidenceRows> {
    if (evidenceItem.canonicalUrl) {
      const existingRows = Array.from(this.rows.values()).find(
        (rows) => rows.evidenceItem.canonicalUrl === evidenceItem.canonicalUrl
      );

      if (existingRows) {
        return existingRows;
      }
    }

    const reusableSource = this.findReusableSource(source);
    const rows = newEvidenceRowsToRows(
      reusableSource ?? source,
      reusableSource
        ? {
            ...evidenceItem,
            sourceId: reusableSource.id
          }
        : evidenceItem
    );

    this.rows.set(rows.evidenceItem.id, rows);

    return rows;
  }

  async selectEvidenceById(id: string): Promise<EvidenceRows | undefined> {
    return this.rows.get(id);
  }

  seed(record: EvidenceRecord): void;
  seed(rows: EvidenceRows): void;
  seed(recordOrRows: EvidenceRecord | EvidenceRows): void {
    const rows = isEvidenceRows(recordOrRows)
      ? recordOrRows
      : evidenceRecordToRows(recordOrRows);

    this.rows.set(rows.evidenceItem.id, rows);
  }

  count(): number {
    return this.rows.size;
  }

  private findReusableSource(source: NewSourceRow): NewSourceRow | undefined {
    const existingSources = Array.from(this.rows.values()).map(
      (rows) => rows.source
    );

    if (source.baseUrl) {
      const existingSource = existingSources.find(
        (row) => row.baseUrl === source.baseUrl
      );

      if (existingSource) {
        return existingSource;
      }
    }

    return existingSources.find(
      (row) =>
        row.canonicalName === source.canonicalName &&
        row.sourceType === source.sourceType
    );
  }
}

export class FakeEvidenceAnchorRowStore implements EvidenceAnchorRowStore {
  private readonly rows = new Map<string, EvidenceAnchorRow>();

  async insertEvidenceAnchor(
    anchor: NewEvidenceAnchorRow
  ): Promise<EvidenceAnchorRow> {
    const row = newEvidenceAnchorRowToRow(anchor);

    this.rows.set(row.id, row);

    return row;
  }

  async selectEvidenceAnchorById(
    id: string
  ): Promise<EvidenceAnchorRow | undefined> {
    return this.rows.get(id);
  }

  async selectEvidenceAnchorsByEvidenceItemId(
    evidenceItemId: string
  ): Promise<EvidenceAnchorRow[]> {
    return Array.from(this.rows.values())
      .filter((row) => row.evidenceItemId === evidenceItemId)
      .sort(compareEvidenceAnchorRowsForList);
  }

  seed(anchor: EvidenceAnchor): void;
  seed(row: EvidenceAnchorRow): void;
  seed(anchorOrRow: EvidenceAnchor | EvidenceAnchorRow): void {
    const row = isEvidenceAnchorRow(anchorOrRow)
      ? anchorOrRow
      : evidenceAnchorToRow(anchorOrRow);

    this.rows.set(row.id, row);
  }
}

function isTopicRow(topicOrRow: Topic | TopicRow): topicOrRow is TopicRow {
  return topicOrRow.createdAt instanceof Date;
}

function isEntryRow(entryOrRow: Entry | EntryRow): entryOrRow is EntryRow {
  return entryOrRow.createdAt instanceof Date;
}

function isAssessmentUpdateRows(
  assessmentUpdateOrRows: AssessmentUpdate | AssessmentUpdateRows
): assessmentUpdateOrRows is AssessmentUpdateRows {
  return "assessment" in assessmentUpdateOrRows;
}

function isEvidenceRows(
  recordOrRows: EvidenceRecord | EvidenceRows
): recordOrRows is EvidenceRows {
  return "evidenceItem" in recordOrRows && "createdAt" in recordOrRows.source;
}

function isEvidenceAnchorRow(
  anchorOrRow: EvidenceAnchor | EvidenceAnchorRow
): anchorOrRow is EvidenceAnchorRow {
  return anchorOrRow.createdAt instanceof Date;
}

function compareTopicRowsForList(left: TopicRow, right: TopicRow): number {
  const updatedAtComparison =
    getTime(right.updatedAt) - getTime(left.updatedAt);

  if (updatedAtComparison !== 0) {
    return updatedAtComparison;
  }

  const createdAtComparison =
    getTime(right.createdAt) - getTime(left.createdAt);

  if (createdAtComparison !== 0) {
    return createdAtComparison;
  }

  return left.id.localeCompare(right.id);
}

function compareEntryRowsForList(left: EntryRow, right: EntryRow): number {
  const sortAtComparison = getTime(right.sortAt) - getTime(left.sortAt);

  if (sortAtComparison !== 0) {
    return sortAtComparison;
  }

  const createdAtComparison =
    getTime(right.createdAt) - getTime(left.createdAt);

  if (createdAtComparison !== 0) {
    return createdAtComparison;
  }

  return left.id.localeCompare(right.id);
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

function compareEvidenceAnchorRowsForList(
  left: EvidenceAnchorRow,
  right: EvidenceAnchorRow
): number {
  const createdAtComparison =
    getTime(right.createdAt) - getTime(left.createdAt);

  if (createdAtComparison !== 0) {
    return createdAtComparison;
  }

  return left.id.localeCompare(right.id);
}

function getTime(value: Date | string): number {
  return new Date(value).getTime();
}
