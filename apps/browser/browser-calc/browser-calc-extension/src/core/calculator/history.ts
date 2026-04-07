import type { HistoryEntry } from "./types";

export const MAX_HISTORY_ENTRIES = 50;

export function appendHistoryEntry(history: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  return [entry, ...history].slice(0, MAX_HISTORY_ENTRIES);
}

export function clearHistory(): HistoryEntry[] {
  return [];
}
