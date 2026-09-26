import assert from "node:assert/strict";
import { test } from "node:test";
import { performance } from "node:perf_hooks";
import {
  closure,
  compare,
  fixture,
  loadMetadata,
  overlaps,
  queryPage,
  sharedRead,
  type Cursor,
  type Entry,
  type Grant
} from "./access.mts";
import {
  chunks,
  digest,
  Store,
  transactionFits,
  type Operation,
  type Plan
} from "./mutations.mts";
import { baseline, costs, elevated, testEnvironment } from "./cost.mts";

test("overlap includes spanning periods, uncertainty and open bounds, including boundaries", () => {
  const base = { source: "t", type: "type", title: "fixture", anchor: 0 };
  const rows = [
    { ...base, id: "long", kind: "period", lower: -500, upper: 1900 },
    { ...base, id: "uncertain", kind: "uncertain", lower: 1700, upper: 1820 },
    { ...base, id: "before", kind: "before", lower: null, upper: 1810 },
    { ...base, id: "after", kind: "after", lower: 1799, upper: null },
    { ...base, id: "boundary", kind: "occurrence", lower: 1800, upper: 1800 },
    { ...base, id: "outside", kind: "period", lower: 1801, upper: 1900 }
  ] satisfies Entry[];
  assert.deepEqual(
    rows.filter((e) => overlaps(e, 1800, 1800)).map((e) => e.id),
    ["long", "uncertain", "before", "after", "boundary"]
  );
  // The naive start-in-viewport query demonstrably loses four valid matches.
  assert.equal(rows.filter((e) => e.lower === 1800).length, 1);
});

test("10,000 entries: all metadata pages, diamond deduplication, sorted pagination, filters and stale cursors", () => {
  const { graph, rows } = fixture();
  const sources = closure(graph, "t0");
  assert.equal(sources.size, 20);
  const loaded: Entry[] = [];
  let pages = 0;
  let bytes = 0;
  for (const source of sources) {
    const result = loadMetadata(
      rows.filter((e) => e.source === source),
      16_384
    );
    loaded.push(...result.loaded);
    pages += result.pages;
    bytes += result.totalBytes;
  }
  assert.equal(loaded.length, 10_000);
  assert.ok(pages > 20);
  const query = { from: 1800, to: 1900 };
  const expected = rows.filter((e) => overlaps(e, 1800, 1900)).sort(compare);
  const result: Entry[] = [];
  let cursor: Cursor | undefined;
  do {
    const page = queryPage(loaded, sources, 5, query, 37, cursor);
    result.push(...page.items);
    cursor = page.next;
  } while (cursor);
  assert.deepEqual(
    result.map((e) => e.id),
    expected.map((e) => e.id)
  );
  assert.equal(new Set(result.map((e) => e.id)).size, result.length);
  const first = queryPage(loaded, sources, 5, query, 37);
  assert.throws(
    () => queryPage(loaded, sources, 6, query, 37, first.next),
    /VIEW_CHANGED/
  );
  assert.throws(
    () =>
      queryPage(
        loaded,
        sources,
        5,
        { ...query, type: "type1" },
        37,
        first.next
      ),
    /VIEW_CHANGED/
  );
  const filtered = queryPage(
    loaded,
    sources,
    5,
    { ...query, type: "type1", text: "synthetic 1" },
    100
  );
  assert.ok(filtered.items.length > 0);
  assert.ok(
    filtered.items.every(
      (e) => e.type === "type1" && e.title.toLowerCase().includes("synthetic 1")
    )
  );
  const samples: number[] = [];
  for (let i = 0; i < 100; i++) {
    const start = performance.now();
    queryPage(loaded, sources, 5, query, 100);
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  console.log(
    JSON.stringify({
      entries: rows.length,
      sources: sources.size,
      metadataPages16KiB: pages,
      metadataBytes: bytes,
      matches: result.length,
      queryP95Ms: samples[94],
      node: process.version,
      platform: process.platform,
      arch: process.arch
    })
  );
});

test("current grants override a warm cache and do not traverse private intermediary sources", () => {
  const { graph, rows } = fixture();
  let grant: Grant = {
    version: 1,
    active: true,
    allowed: new Set(["t0", "t1", "t3"])
  };
  const read = () => sharedRead(graph, "t0", rows, () => grant);
  assert.deepEqual(new Set(read().map((e) => e.source)), grant.allowed);
  graph.get("t1")!.push("t4");
  assert.ok(read().every((e) => e.source !== "t4"));
  grant = { ...grant, version: 2, allowed: new Set(["t0", "t3"]) };
  assert.ok(read().every((e) => e.source === "t0"));
  assert.throws(
    () =>
      sharedRead(
        graph,
        "t0",
        rows,
        () => grant,
        () => {
          grant = { ...grant, version: 3, active: false };
        }
      ),
    /NOT_FOUND/
  );
  assert.throws(read, /NOT_FOUND/);
});

test("publication is atomic, idempotent, version-checked and retains first-write history", () => {
  const store = new Store();
  const plan: Plan = {
    id: "batch",
    epoch: 0,
    operations: [
      { id: "a", expected: 0, value: "first" },
      { id: "b", expected: 0, value: "second" }
    ]
  };
  assert.throws(
    () => store.apply(plan, digest(plan), true),
    /TRANSACTION_CANCELED/
  );
  assert.equal(store.entities.size, 0);
  assert.equal(store.revisions.size, 0);
  assert.equal(store.batches.size, 0);
  const batch = store.apply(plan);
  assert.equal(store.apply(plan), batch);
  assert.equal(store.revisions.get("a")!.length, 1);
  assert.throws(
    () =>
      store.apply({
        ...plan,
        operations: [{ id: "a", expected: 0, value: "tampered" }]
      }),
    /IDEMPOTENCY_CONFLICT/
  );
  assert.throws(
    () => store.apply({ ...plan, id: "changed" }, digest(plan)),
    /PREVIEW_CHANGED/
  );
  const stale: Plan = {
    id: "stale",
    epoch: 1,
    operations: [
      { id: "b", expected: 1, value: "would change" },
      { id: "a", expected: 0, value: "stale" }
    ]
  };
  assert.throws(() => store.apply(stale), /VERSION_CONFLICT/);
  assert.equal(store.entities.get("b")!.value, "second");
});

test("two independently valid inclusion previews cannot publish a cycle", () => {
  const store = new Store();
  store.graph = new Map([
    ["a", []],
    ["b", []]
  ]);
  store.apply({
    id: "ab",
    epoch: 0,
    operations: [{ id: "ab", expected: 0, value: "a includes b" }],
    graph: [
      ["a", ["b"]],
      ["b", []]
    ]
  });
  const other: Plan = {
    id: "ba",
    epoch: 0,
    operations: [{ id: "ba", expected: 0, value: "b includes a" }],
    graph: [
      ["a", []],
      ["b", ["a"]]
    ]
  };
  assert.throws(() => store.apply(other), /VERSION_CONFLICT/);
  assert.throws(
    () =>
      store.apply({
        ...other,
        epoch: 1,
        graph: [
          ["a", ["b"]],
          ["b", ["a"]]
        ]
      }),
    /CYCLE/
  );
  assert.equal(store.entities.has("ba"), false);
});

test("undo appends history, duplicate undo replays, later edits conflict", () => {
  const store = new Store();
  store.apply({
    id: "initial",
    epoch: 0,
    operations: [{ id: "a", expected: 0, value: "old" }]
  });
  store.apply({
    id: "edit",
    epoch: 1,
    operations: [{ id: "a", expected: 1, value: "new" }]
  });
  const undo = store.undoPlan("edit", "undo");
  const result = store.apply(undo);
  assert.equal(store.apply(undo), result);
  assert.equal(store.entities.get("a")!.value, "old");
  assert.equal(store.revisions.get("a")!.length, 3);
  assert.throws(
    () => store.apply(store.undoPlan("initial", "conflict")),
    /VERSION_CONFLICT/
  );
});

test("45-row import has explicit 20/20/5 publication boundaries; second-chunk failure preserves only chunk one", () => {
  const operations: Operation[] = Array.from({ length: 45 }, (_, i) => ({
    id: `e${i}`,
    expected: 0,
    value: "imported"
  }));
  const parts = chunks(operations);
  assert.deepEqual(
    parts.map((p) => p.length),
    [20, 20, 5]
  );
  const store = new Store();
  assert.throws(
    () => store.apply({ id: "oversize", epoch: 0, operations }),
    /BATCH_SIZE/
  );
  assert.equal(store.entities.size, 0);
  store.apply({ id: "chunk1", epoch: 0, operations: parts[0] });
  const second = {
    id: "chunk2",
    epoch: 1,
    operations: parts[1]
  } satisfies Plan;
  assert.throws(
    () => store.apply(second, digest(second), true),
    /TRANSACTION_CANCELED/
  );
  assert.equal(store.entities.size, 20);
  store.apply(second);
  store.apply(second);
  store.apply({ id: "chunk3", epoch: 2, operations: parts[2] });
  assert.equal(store.entities.size, 45);
  assert.equal(store.batches.size, 3);
  assert.equal(transactionFits(90, 2 * 1024 * 1024), true);
  assert.equal(transactionFits(91, 1), false);
  assert.equal(transactionFits(1, 2 * 1024 * 1024 + 1), false);
});

test("cost arithmetic includes both environments, transactional write units and retention sensitivity", () => {
  assert.ok(Math.abs(costs(baseline).total - 2.99116675) < 1e-8);
  assert.ok(costs(baseline).total + costs(testEnvironment).total < 20);
  assert.ok(costs(elevated).total + costs(testEnvironment).total > 20);
  assert.ok(
    Math.abs(
      costs({ ...baseline, tableGB: 1.5, backupGB: 3 }).total -
        costs(baseline).total -
        0.65
    ) < 1e-8
  );
});
