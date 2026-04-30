import { describe, expect, it } from "vitest";
import { evaluateExpression } from "./evaluator";

describe("evaluateExpression", () => {
  it("evaluates scientific expressions with precedence, powers, and implicit multiplication", () => {
    const result = evaluateExpression("2π + 3^2", null);

    expect(result.ok).toBe(true);
    expect(result).toMatchObject({
      resolvedExpression: "2π + 3^2"
    });

    if (result.ok) {
      expect(result.value).toBeCloseTo(2 * Math.PI + 9);
    }
  });

  it("supports roots, factorial, percent, absolute value, and exponent notation", () => {
    const result = evaluateExpression(
      "√(81) + ∛(27) + 5! + |−4| + 1EE3%",
      null
    );

    expect(result).toEqual({
      ok: true,
      value: 146,
      resolvedExpression: "√(81) + ∛(27) + 5! + |−4| + 1EE3%"
    });
  });

  it("supports trig functions in degrees and radians", () => {
    const degrees = evaluateExpression(
      "sin(30) + cos(60) + tan⁻¹(1)",
      null,
      "DEG"
    );
    const radians = evaluateExpression("sin(π÷2)", null, "RAD");

    expect(degrees.ok).toBe(true);
    expect(radians.ok).toBe(true);

    if (degrees.ok) {
      expect(degrees.value).toBeCloseTo(46, 8);
    }

    if (radians.ok) {
      expect(radians.value).toBeCloseTo(1, 8);
    }
  });

  it("supports logarithms, nth roots, explicit ANS, and implicit chaining", () => {
    expect(evaluateExpression("log(1000) + ln(e) + ⁿ√(2,16)", null)).toEqual({
      ok: true,
      value: 8,
      resolvedExpression: "log(1000) + ln(e) + ⁿ√(2,16)"
    });

    expect(evaluateExpression("ANS + 2", 10)).toEqual({
      ok: true,
      value: 12,
      resolvedExpression: "ANS + 2"
    });

    expect(evaluateExpression("^2", 5)).toEqual({
      ok: true,
      value: 25,
      resolvedExpression: "5 ^ 2"
    });
  });

  it("fails for invalid expressions and divide by zero", () => {
    expect(evaluateExpression("ANS + 2", null)).toEqual({
      ok: false,
      error: "Invalid expression."
    });

    expect(evaluateExpression("8 ÷ 0", null)).toEqual({
      ok: false,
      error: "Cannot divide by zero."
    });

    expect(evaluateExpression("√(−1)", null)).toEqual({
      ok: false,
      error: "Invalid expression."
    });
  });
});
