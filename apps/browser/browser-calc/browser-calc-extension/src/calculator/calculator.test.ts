import { describe, expect, it } from "vitest";
import { getInitialCalculatorState, reduceCalculator, type CalculatorAction } from "./calculator";

function runActions(actions: CalculatorAction[]) {
  return actions.reduce(reduceCalculator, getInitialCalculatorState());
}

describe("reduceCalculator", () => {
  it("handles basic digit and operator flow", () => {
    const result = runActions([
      { type: "digit", digit: "1" },
      { type: "digit", digit: "2" },
      { type: "operator", operator: "+" },
      { type: "digit", digit: "3" },
      { type: "equals" }
    ]);

    expect(result.display).toBe("15");
  });

  it("executes chained operations left-to-right", () => {
    const result = runActions([
      { type: "digit", digit: "2" },
      { type: "operator", operator: "+" },
      { type: "digit", digit: "3" },
      { type: "operator", operator: "*" },
      { type: "digit", digit: "4" },
      { type: "equals" }
    ]);

    expect(result.display).toBe("20");
  });

  it("supports decimal entry and normalizes precision artifacts", () => {
    const result = runActions([
      { type: "digit", digit: "0" },
      { type: "decimal" },
      { type: "digit", digit: "1" },
      { type: "operator", operator: "+" },
      { type: "digit", digit: "0" },
      { type: "decimal" },
      { type: "digit", digit: "2" },
      { type: "equals" }
    ]);

    expect(result.display).toBe("0.3");
  });

  it("handles clear and backspace", () => {
    const backspaced = runActions([
      { type: "digit", digit: "1" },
      { type: "digit", digit: "2" },
      { type: "backspace" }
    ]);

    expect(backspaced.display).toBe("1");

    const cleared = reduceCalculator(backspaced, { type: "clear" });
    expect(cleared.display).toBe("0");
  });

  it("handles sign toggle and percent", () => {
    const result = runActions([
      { type: "digit", digit: "5" },
      { type: "toggleSign" },
      { type: "percent" }
    ]);

    expect(result.display).toBe("-0.05");
  });

  it("surfaces divide-by-zero as Error and resets on next digit", () => {
    const errored = runActions([
      { type: "digit", digit: "8" },
      { type: "operator", operator: "/" },
      { type: "digit", digit: "0" },
      { type: "equals" }
    ]);

    expect(errored.display).toBe("Error");

    const recovered = reduceCalculator(errored, { type: "digit", digit: "9" });
    expect(recovered.display).toBe("9");
  });

  it("treats repeated equals without pending operator as no-op", () => {
    const result = runActions([
      { type: "digit", digit: "7" },
      { type: "equals" },
      { type: "equals" }
    ]);

    expect(result.display).toBe("7");
  });
});
