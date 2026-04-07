import { describe, expect, it } from "vitest";
import { evaluateExpression } from "./evaluator";

describe("evaluateExpression", () => {
  it("evaluates expressions with standard operator precedence", () => {
    const result = evaluateExpression("12 + 5 * 2", null);

    expect(result).toEqual({
      ok: true,
      value: 22,
      resolvedExpression: "12 + 5 × 2"
    });
  });

  it("supports decimals and postfix percent", () => {
    const result = evaluateExpression("50% * 200.5", null);

    expect(result).toEqual({
      ok: true,
      value: 100.25,
      resolvedExpression: "50% × 200.5"
    });
  });

  it("supports explicit ANS and implicit chaining", () => {
    expect(evaluateExpression("ANS + 2", 10)).toEqual({
      ok: true,
      value: 12,
      resolvedExpression: "ANS + 2"
    });

    expect(evaluateExpression("+ 5", 10)).toEqual({
      ok: true,
      value: 15,
      resolvedExpression: "10 + 5"
    });
  });

  it("accepts whitespace and unary minus", () => {
    const result = evaluateExpression("  -2.5   *  4 ", null);

    expect(result).toEqual({
      ok: true,
      value: -10,
      resolvedExpression: "−2.5   ×  4"
    });
  });

  it("fails for invalid expressions and divide by zero", () => {
    expect(evaluateExpression("ANS + 2", null)).toEqual({
      ok: false,
      error: "Invalid expression."
    });

    expect(evaluateExpression("8 / 0", null)).toEqual({
      ok: false,
      error: "Cannot divide by zero."
    });
  });
});
