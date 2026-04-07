import { describe, expect, it, vi } from "vitest";
import { getInitialCalculatorState, reduceCalculator } from "./reducer";
import type { CalculatorAction } from "./actions";

function runActions(actions: CalculatorAction[]) {
  return actions.reduce(reduceCalculator, getInitialCalculatorState());
}

describe("reduceCalculator", () => {
  it("inserts at the cursor and replaces selections", () => {
    const result = runActions([
      { type: "INSERT_CHAR", value: "1" },
      { type: "INSERT_CHAR", value: "2" },
      { type: "INSERT_CHAR", value: "3" },
      { type: "MOVE_CURSOR", selectionStart: 1, selectionEnd: 1 },
      { type: "INSERT_CHAR", value: "9" },
      { type: "MOVE_CURSOR", selectionStart: 1, selectionEnd: 3 },
      { type: "INSERT_CHAR", value: "4" }
    ]);

    expect(result.expression).toBe("143");
    expect(result.selectionStart).toBe(2);
    expect(result.selectionEnd).toBe(2);
  });

  it("deletes from the cursor or active selection", () => {
    const result = runActions([
      { type: "SET_EXPRESSION", expression: "1234", selectionStart: 2, selectionEnd: 2 },
      { type: "DELETE_CHAR", direction: "backward" },
      { type: "MOVE_CURSOR", selectionStart: 1, selectionEnd: 3 },
      { type: "DELETE_CHAR", direction: "forward" }
    ]);

    expect(result.expression).toBe("1");
    expect(result.selectionStart).toBe(1);
  });

  it("tracks history and lastResult only after successful evaluation", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(123);

    const successful = runActions([
      { type: "SET_EXPRESSION", expression: "12 + 5 * 2", selectionStart: 10, selectionEnd: 10 },
      { type: "EVALUATE" }
    ]);

    expect(successful.result).toBe(22);
    expect(successful.lastResult).toBe(22);
    expect(successful.history).toEqual([
      {
        expression: "12 + 5 × 2",
        result: 22,
        timestamp: 123
      }
    ]);

    const failed = reduceCalculator(
      {
        ...successful,
        expression: "8 / 0",
        selectionStart: 5,
        selectionEnd: 5
      },
      { type: "EVALUATE" }
    );

    expect(failed.result).toBeNull();
    expect(failed.lastResult).toBe(22);
    expect(failed.history).toHaveLength(1);
    expect(failed.errorMessage).toBe("Cannot divide by zero.");

    now.mockRestore();
  });

  it("supports explicit ANS, implicit chaining, and recalling history as a completed result", () => {
    const result = runActions([
      { type: "SET_EXPRESSION", expression: "5 + 5", selectionStart: 5, selectionEnd: 5 },
      { type: "EVALUATE" },
      { type: "CLEAR" },
      { type: "SET_EXPRESSION", expression: "+ 5", selectionStart: 3, selectionEnd: 3 },
      { type: "EVALUATE" },
      { type: "CLEAR" },
      { type: "SET_EXPRESSION", expression: "ANS + 2", selectionStart: 7, selectionEnd: 7 },
      { type: "EVALUATE" },
      { type: "CLEAR" },
      {
        type: "SET_FROM_HISTORY",
        entry: {
          expression: "6 × 2",
          result: 12,
          timestamp: 99
        }
      }
    ]);

    expect(result.lastResult).toBe(12);
    expect(result.result).toBe(12);
    expect(result.expression).toBe("6 × 2");
    expect(result.history[0]?.result).toBe(17);
  });

  it("keeps history when clearing and clears history separately", () => {
    const evaluated = runActions([
      { type: "SET_EXPRESSION", expression: "2 + 2", selectionStart: 5, selectionEnd: 5 },
      { type: "EVALUATE" },
      { type: "CLEAR" }
    ]);

    expect(evaluated.expression).toBe("");
    expect(evaluated.lastResult).toBe(4);
    expect(evaluated.history).toHaveLength(1);

    const clearedHistory = reduceCalculator(evaluated, { type: "CLEAR_HISTORY" });

    expect(clearedHistory.history).toEqual([]);
    expect(clearedHistory.lastResult).toBe(4);
  });

  it("expands operator-led drafts with the previous result after evaluation", () => {
    const result = runActions([
      { type: "SET_EXPRESSION", expression: "25×2", selectionStart: 4, selectionEnd: 4 },
      { type: "EVALUATE" },
      { type: "SET_EXPRESSION", expression: "×3", selectionStart: 2, selectionEnd: 2 }
    ]);

    expect(result.expression).toBe("50×3");
    expect(result.selectionStart).toBe(4);
    expect(result.result).toBeNull();
    expect(result.lastResult).toBe(50);
  });

  it("starts fresh or chains from the visible result for button-style inserts", () => {
    const chained = runActions([
      { type: "SET_EXPRESSION", expression: "25×2", selectionStart: 4, selectionEnd: 4 },
      { type: "EVALUATE" },
      { type: "INSERT_CHAR", value: "×" },
      { type: "INSERT_CHAR", value: "3" }
    ]);

    expect(chained.expression).toBe("50×3");
    expect(chained.result).toBeNull();

    const restarted = runActions([
      { type: "SET_EXPRESSION", expression: "25×2", selectionStart: 4, selectionEnd: 4 },
      { type: "EVALUATE" },
      { type: "INSERT_CHAR", value: "9" }
    ]);

    expect(restarted.expression).toBe("9");
    expect(restarted.result).toBeNull();
    expect(restarted.lastResult).toBe(50);
  });
});
