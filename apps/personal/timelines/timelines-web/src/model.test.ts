import { describe, expect, it } from "vitest";
import {
  axisLabel,
  viewportLabel,
  datePosition,
  entryDate,
  overlaps,
  validateEntry,
  validDate
} from "./dates";
import { createFixture } from "./fixtures";
import {
  canInclude,
  resolveSources,
  revisionConflicts,
  type Entry,
  type Revision
} from "./model";
import { columnCount, groupLane } from "./timelineLayout";

describe("historical presentation contracts", () => {
  it("crosses BCE/CE without a displayed year zero and preserves precision", () => {
    expect(
      datePosition({ year: 1, era: "CE" }) -
        datePosition({ year: 1, era: "BCE" })
    ).toBe(1);
    expect(axisLabel(0)).toBe("1 BCE");
    expect(axisLabel(-508)).toBe("509 BCE");
    expect(viewportLabel(1865.5, 2)).toBe("Jul 1865");
    expect(viewportLabel(0, 0.1)).toBe("1 Jan 1 BCE");
    expect(validDate({ year: 0, era: "CE" })).toBe(false);
    expect(validDate({ year: 1900, era: "CE", month: 2, day: 29 })).toBe(false);
    expect(validDate({ year: 2000, era: "CE", month: 2, day: 29 })).toBe(true);
    expect(validDate({ year: 1865, era: "CE", day: 2 })).toBe(false);
    expect(datePosition({ year: 1865, era: "CE" }, true)).toBe(1866);
  });

  it("distinguishes a duration, an uncertain occurrence, and open bounds", () => {
    const fixture = createFixture();
    const period = fixture.entries.find(
      (entry) => entry.id === "reconstruction"
    )!;
    const range = fixture.entries.find((entry) => entry.id === "network")!;
    const before = fixture.entries.find((entry) => entry.id === "organizing")!;
    const after = fixture.entries.find((entry) => entry.id === "education")!;
    expect(entryDate(period)).toBe("1865 – 1877 (period)");
    expect(entryDate(range)).toBe("1825 – 1835 (uncertain occurrence)");
    expect(entryDate(before)).toBe("Before 1830");
    expect(overlaps(period, { start: 1870, end: 1872 })).toBe(true);
    expect(overlaps(before, { start: 1750, end: 1800 })).toBe(true);
    expect(overlaps(after, { start: 1900, end: 1950 })).toBe(true);
    expect(
      validateEntry({ ...period, end: { year: 1860, era: "CE" } })
    ).toMatch(/end date/);
    expect(validateEntry({ ...period, end: undefined })).toMatch(/end date/);
  });
});

describe("live composition and recovery", () => {
  it("deduplicates nested sources and prevents a cycle", () => {
    const { timelines } = createFixture();
    expect(resolveSources(timelines, "america")).toEqual([
      "america",
      "founding",
      "democracy",
      "reform"
    ]);
    expect(canInclude(timelines, "reform", "america")).toBe(false);
    expect(canInclude(timelines, "reform", "long-view")).toBe(true);
  });

  it("refuses to undo over a newer edit while allowing the unchanged batch", () => {
    const before = createFixture().entries[0];
    const after: Entry = { ...before, title: "Reviewed title" };
    const revision: Revision = {
      id: 1,
      name: "Review",
      before: [before],
      after: [after],
      undone: false
    };
    expect(revisionConflicts([after], revision)).toBe(false);
    expect(
      revisionConflicts([{ ...after, title: "Later correction" }], revision)
    ).toBe(true);
    expect(revisionConflicts([], revision)).toBe(true);
  });

  it("bounds dense rendering without dropping any of 10,000 entries", () => {
    const fixture = createFixture(true);
    const groups = fixture.timelines.flatMap((source) =>
      groupLane(
        fixture.entries.filter((entry) => entry.sourceId === source.id),
        { start: 1500, end: 2100 }
      )
    );
    expect(groups.length).toBeLessThanOrEqual(20 * columnCount);
    expect(groups.flatMap((group) => group.entries)).toHaveLength(10000);
    expect(resolveSources(fixture.timelines, "scale")).toHaveLength(21);
  });
});
