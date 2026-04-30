import { entrySchema, type Entry } from "@repo/signal-tracker-shared";

import {
  nullableDateToIso,
  nullableTimestampToDate,
  toDate,
  toIsoTimestamp
} from "../persistence/timestamps";
import type { EntryRow, NewEntryRow } from "./postgres-entry-repository";

export function mapEntryRow(row: EntryRow): Entry {
  return entrySchema.parse({
    id: row.id,
    topicId: row.topicId,
    kind: row.kind,
    epistemicStatus: row.epistemicStatus,
    title: row.title,
    bodyMd: row.bodyMd,
    sortAt: toIsoTimestamp(row.sortAt),
    isApproximateDate: row.isApproximateDate,
    originType: row.originType,
    status: row.status,
    createdAt: toIsoTimestamp(row.createdAt),
    updatedAt: toIsoTimestamp(row.updatedAt),
    archivedAt: nullableDateToIso(row.archivedAt),
    deletedAt: nullableDateToIso(row.deletedAt)
  });
}

export function mapEntryToNewEntryRow(entry: Entry): NewEntryRow {
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
