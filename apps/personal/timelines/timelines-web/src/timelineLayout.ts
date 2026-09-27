import { datePosition, overlaps } from "./dates";
import type { Entry, Viewport } from "./model";

export type EntryGroup = { slot: number; entries: Entry[] };

// Seven fixed label columns bound DOM work and prevent collisions at every zoom.
// These are explicitly labeled date buckets, not falsely precise event positions.
export const columnCount = 7;
export function groupLane(entries: Entry[], viewport: Viewport): EntryGroup[] {
  const groups = new Map<number, Entry[]>();
  for (const entry of entries) {
    if (!overlaps(entry, viewport)) continue;
    const position = datePosition(entry.start);
    const fraction =
      (position - viewport.start) / (viewport.end - viewport.start);
    const slot = Math.min(
      columnCount - 1,
      Math.max(0, Math.floor(fraction * columnCount))
    );
    const group = groups.get(slot) ?? [];
    group.push(entry);
    groups.set(slot, group);
  }
  return [...groups]
    .sort(([left], [right]) => left - right)
    .map(([slot, grouped]) => ({ slot, entries: grouped }));
}
