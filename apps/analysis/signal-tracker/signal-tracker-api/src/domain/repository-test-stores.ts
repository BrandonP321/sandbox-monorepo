import type {
  AssessmentUpdate,
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
import {
  assessmentUpdateToRows,
  entryToRow,
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
    return Array.from(this.rows.values())
      .filter(
        (rows) =>
          rows.entry.topicId === topicId &&
          rows.entry.kind === "assessment" &&
          rows.entry.status === "active"
      )
      .sort(compareAssessmentRowsForList)[0];
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

function getTime(value: Date | string): number {
  return new Date(value).getTime();
}
