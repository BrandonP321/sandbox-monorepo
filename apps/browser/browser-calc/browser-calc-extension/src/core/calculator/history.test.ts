import { describe, expect, it } from "vitest";
import {
  appendHistoryEntry,
  clearHistory,
  MAX_HISTORY_ENTRIES
} from "./history";

describe("history helpers", () => {
  it("prepends new history entries and preserves existing order", () => {
    const history = appendHistoryEntry(
      [
        { expression: "2+2", result: 4, timestamp: 2 },
        { expression: "1+1", result: 2, timestamp: 1 }
      ],
      { expression: "3+3", result: 6, timestamp: 3 }
    );

    expect(history).toEqual([
      { expression: "3+3", result: 6, timestamp: 3 },
      { expression: "2+2", result: 4, timestamp: 2 },
      { expression: "1+1", result: 2, timestamp: 1 }
    ]);
  });

  it("caps history length at fifty entries", () => {
    const history = Array.from({ length: MAX_HISTORY_ENTRIES }, (_, index) => ({
      expression: `${index}+${index}`,
      result: index * 2,
      timestamp: index
    }));

    const nextHistory = appendHistoryEntry(history, {
      expression: "overflow",
      result: 999,
      timestamp: 999
    });

    expect(nextHistory).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(nextHistory[0]).toEqual({
      expression: "overflow",
      result: 999,
      timestamp: 999
    });
    expect(nextHistory.at(-1)?.timestamp).toBe(48);
  });

  it("clears history", () => {
    expect(clearHistory()).toEqual([]);
  });
});
