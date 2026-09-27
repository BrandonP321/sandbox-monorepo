// Disposable UI model. Production historical-date contracts belong to issue #104.
export type HistoricalDate = {
  year: number;
  era: "BCE" | "CE";
  month?: number;
  day?: number;
};
export type Entry = {
  id: string;
  sourceId: string;
  typeId: string;
  title: string;
  description: string;
  start: HistoricalDate;
  end?: HistoricalDate;
  shape: "point" | "period" | "range";
  qualifier: "exact" | "approximate" | "before" | "after";
  reference: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
};
export type Timeline = {
  id: string;
  title: string;
  description: string;
  color: string;
  includes: string[];
};
export type EntryType = { id: string; name: string; color: string };
export type Fixture = {
  timelines: Timeline[];
  entries: Entry[];
  types: EntryType[];
};
export type Viewport = { start: number; end: number };
export type Revision = {
  id: number;
  name: string;
  before: Entry[];
  after: Entry[];
  undone: boolean;
};

export function resolveSources(
  timelines: Timeline[],
  rootId: string
): string[] {
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    timelines.find((timeline) => timeline.id === id)?.includes.forEach(visit);
  };
  visit(rootId);
  return [...visited];
}

export function canInclude(
  timelines: Timeline[],
  targetId: string,
  sourceId: string
) {
  return !resolveSources(timelines, sourceId).includes(targetId);
}

export function revisionConflicts(entries: Entry[], revision: Revision) {
  return revision.after.some(
    (after) =>
      JSON.stringify(entries.find((entry) => entry.id === after.id)) !==
      JSON.stringify(after)
  );
}
