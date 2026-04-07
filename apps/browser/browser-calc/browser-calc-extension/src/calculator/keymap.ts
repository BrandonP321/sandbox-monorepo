import type { CalculatorAction, CalculatorOperator } from "./calculator";

const OPERATOR_BY_KEY: Record<string, CalculatorOperator> = {
  "+": "+",
  "-": "-",
  "*": "*",
  "/": "/"
};

export function keyToCalculatorAction(
  key: string,
  modifiers: { ctrlKey: boolean; metaKey: boolean; altKey: boolean }
): CalculatorAction | null {
  if (modifiers.ctrlKey || modifiers.metaKey || modifiers.altKey) {
    return null;
  }

  if (/^[0-9]$/.test(key)) {
    return { type: "digit", digit: key };
  }

  if (key === ".") {
    return { type: "decimal" };
  }

  if (key in OPERATOR_BY_KEY) {
    return { type: "operator", operator: OPERATOR_BY_KEY[key] };
  }

  if (key === "Enter" || key === "=") {
    return { type: "equals" };
  }

  if (key === "Backspace") {
    return { type: "backspace" };
  }

  if (key === "Escape" || key.toLowerCase() === "c") {
    return { type: "clear" };
  }

  if (key === "%") {
    return { type: "percent" };
  }

  return null;
}
