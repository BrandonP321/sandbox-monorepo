import { describe, expect, it, vi } from "vitest";
import { getInitialCalculatorState, reduceCalculator } from "./reducer";
import type { CalculatorAction } from "./actions";

function runActions(actions: CalculatorAction[]) {
  return actions.reduce(reduceCalculator, getInitialCalculatorState());
}

describe("reduceCalculator", () => {
  it("sanitizes keyboard aliases into calculator display syntax", () => {
    const result = runActions([
      {
        type: "SET_EXPRESSION",
        expression: "sqrt(9)+asin(.5)+pi+1e3",
        selectionStart: 23,
        selectionEnd: 23
      }
    ]);

    expect(result.expression).toBe("√(9)+sin⁻¹(.5)+π+1EE3");
    expect(result.selectionStart).toBe(result.expression.length);
  });

  it("tracks history and successful scientific evaluation results", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(123);

    const successful = runActions([
      { type: "SET_EXPRESSION", expression: "10^2 + 5!", selectionStart: 9, selectionEnd: 9 },
      { type: "EVALUATE" }
    ]);

    expect(successful.result).toBe(220);
    expect(successful.lastResult).toBe(220);
    expect(successful.history).toEqual([
      {
        expression: "10^2 + 5!",
        result: 220,
        timestamp: 123
      }
    ]);

    const failed = reduceCalculator(
      {
        ...successful,
        expression: "8 ÷ 0",
        selectionStart: 5,
        selectionEnd: 5
      },
      { type: "EVALUATE" }
    );

    expect(failed.result).toBeNull();
    expect(failed.lastResult).toBe(220);
    expect(failed.history).toHaveLength(1);
    expect(failed.errorMessage).toBe("Cannot divide by zero.");

    now.mockRestore();
  });

  it("supports explicit ANS, implicit chaining, and recalling history as a completed result", () => {
    const result = runActions([
      { type: "SET_EXPRESSION", expression: "5 + 5", selectionStart: 5, selectionEnd: 5 },
      { type: "EVALUATE" },
      { type: "CLEAR" },
      { type: "SET_EXPRESSION", expression: "^2", selectionStart: 2, selectionEnd: 2 },
      { type: "EVALUATE" },
      { type: "CLEAR" },
      { type: "SET_EXPRESSION", expression: "ANS + 2", selectionStart: 7, selectionEnd: 7 },
      { type: "EVALUATE" },
      { type: "CLEAR" },
      {
        type: "SET_FROM_HISTORY",
        entry: {
          expression: "20^2",
          result: 400,
          timestamp: 99
        }
      }
    ]);

    expect(result.lastResult).toBe(400);
    expect(result.result).toBe(400);
    expect(result.expression).toBe("20^2");
    expect(result.history[0]?.result).toBe(102);
  });

  it("preserves last result on CE and resets it on AC", () => {
    const clearedEntry = runActions([
      { type: "SET_EXPRESSION", expression: "2 + 2", selectionStart: 5, selectionEnd: 5 },
      { type: "EVALUATE" },
      { type: "CLEAR" }
    ]);

    expect(clearedEntry.expression).toBe("");
    expect(clearedEntry.lastResult).toBe(4);
    expect(clearedEntry.history).toHaveLength(1);

    const allCleared = reduceCalculator(clearedEntry, { type: "ALL_CLEAR" });

    expect(allCleared.lastResult).toBeNull();
    expect(allCleared.history).toHaveLength(1);
  });

  it("stores, recalls, and subtracts memory using the current display value", () => {
    const result = runActions([
      { type: "SET_EXPRESSION", expression: "5 × 5", selectionStart: 5, selectionEnd: 5 },
      { type: "EVALUATE" },
      { type: "MEMORY_ADD" },
      { type: "CLEAR" },
      { type: "MEMORY_RECALL" },
      { type: "INSERT_CHAR", value: "+" },
      { type: "INSERT_CHAR", value: "5" },
      { type: "EVALUATE" },
      { type: "MEMORY_SUBTRACT" }
    ]);

    expect(result.memoryValue).toBe(-5);
    expect(result.expression).toBe("25+5");
    expect(result.result).toBe(30);
  });

  it("changes angle mode without disturbing the current draft", () => {
    const result = runActions([
      { type: "SET_EXPRESSION", expression: "sin(30)", selectionStart: 7, selectionEnd: 7 },
      { type: "SET_ANGLE_MODE", value: "RAD" }
    ]);

    expect(result.angleMode).toBe("RAD");
    expect(result.expression).toBe("sin(30)");
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
});
