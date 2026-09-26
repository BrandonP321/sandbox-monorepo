// Synthetic access model only. Coordinates stand in for #104's historical days.
export type Entry = {
  id: string;
  source: string;
  type: string;
  kind: "occurrence" | "period" | "uncertain" | "before" | "after";
  lower: number | null;
  upper: number | null;
  anchor: number;
  title: string;
};
export type Graph = Map<string, string[]>;

export function closure(graph: Graph, root: string, allowed?: Set<string>) {
  const seen = new Set<string>();
  const path = new Set<string>();
  function visit(id: string) {
    if (allowed && !allowed.has(id)) return;
    if (path.has(id)) throw new Error("CYCLE");
    if (seen.has(id)) return;
    if (!graph.has(id)) throw new Error("MISSING_SOURCE");
    path.add(id);
    for (const child of graph.get(id)!) visit(child);
    path.delete(id);
    seen.add(id);
  }
  visit(root);
  return seen;
}

export function overlaps(entry: Entry, from: number, to: number) {
  return (entry.lower ?? -Infinity) <= to && (entry.upper ?? Infinity) >= from;
}

export function compare(a: Entry, b: Entry) {
  return a.anchor - b.anchor || a.id.localeCompare(b.id, "en");
}

// Models strongly consistent Query pages over materialized E#id rows, not Scan.
// A small page byte limit makes the fixture exercise LastEvaluatedKey behavior.
export function loadMetadata(rows: Entry[], pageBytes = 1024 * 1024) {
  const ordered = [...rows].sort((a, b) => a.id.localeCompare(b.id, "en"));
  const loaded: Entry[] = [];
  let pages = 0;
  let bytes = 0;
  let totalBytes = 0;
  for (const row of ordered) {
    const size = Buffer.byteLength(JSON.stringify(row));
    if (size > pageBytes) throw new Error("ROW_TOO_LARGE");
    if (!bytes || bytes + size > pageBytes) {
      pages++;
      bytes = 0;
    }
    bytes += size;
    totalBytes += size;
    loaded.push(row);
  }
  return { loaded, pages, totalBytes };
}

export type Cursor = { epoch: number; offset: number; query: string };
export function queryPage(
  rows: Entry[],
  sources: Set<string>,
  epoch: number,
  query: { from: number; to: number; type?: string; text?: string },
  limit: number,
  cursor?: Cursor
) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("INVALID_LIMIT");
  }
  const identity = JSON.stringify([query, [...sources].sort()]);
  if (cursor && (cursor.epoch !== epoch || cursor.query !== identity)) {
    throw new Error("VIEW_CHANGED");
  }
  const matches = rows
    .filter(
      (e) =>
        sources.has(e.source) &&
        overlaps(e, query.from, query.to) &&
        (!query.type || e.type === query.type) &&
        (!query.text ||
          e.title.toLowerCase().includes(query.text.toLowerCase()))
    )
    .sort(compare);
  const offset = cursor?.offset ?? 0;
  return {
    items: matches.slice(offset, offset + limit),
    next:
      offset + limit < matches.length
        ? { epoch, offset: offset + limit, query: identity }
        : undefined
  };
}

export function fixture() {
  const graph: Graph = new Map(
    Array.from({ length: 20 }, (_, i) => [`t${i}`, []])
  );
  graph.set("t0", ["t1", "t2"]);
  graph.set("t1", ["t3"]);
  graph.set("t2", ["t3", ...Array.from({ length: 16 }, (_, i) => `t${i + 4}`)]);
  const rows: Entry[] = Array.from({ length: 10_000 }, (_, i) => {
    const anchor = i % 2 ? 1800 + (i % 200) : -8000 + i;
    const kind = (
      ["occurrence", "period", "uncertain", "before", "after"] as const
    )[i % 5];
    return {
      id: `e${String(i).padStart(6, "0")}`,
      source: `t${i % 20}`,
      type: `type${i % 4}`,
      kind,
      lower: kind === "before" ? null : anchor,
      upper:
        kind === "after"
          ? null
          : anchor +
            (kind === "period" ? 1000 : kind === "uncertain" ? 100 : 0),
      anchor,
      title: `Synthetic ${i}`
    };
  });
  return { graph, rows };
}

export type Grant = { version: number; active: boolean; allowed: Set<string> };
export function sharedRead(
  graph: Graph,
  root: string,
  cachedRows: Entry[],
  getGrant: () => Grant,
  beforeFinalCheck: () => void = () => {}
) {
  const initial = getGrant();
  if (!initial.active) throw new Error("NOT_FOUND");
  const sources = closure(graph, root, initial.allowed);
  const response = cachedRows.filter((row) => sources.has(row.source));
  beforeFinalCheck();
  const current = getGrant();
  if (!current.active || current.version !== initial.version)
    throw new Error("NOT_FOUND");
  return response;
}
