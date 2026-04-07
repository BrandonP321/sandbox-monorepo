import { formatNumber } from "./format";
import { formatExpressionDisplay } from "./input";
import type { AngleMode, EvaluatorResult } from "./types";

type FunctionName =
  | "sin"
  | "cos"
  | "tan"
  | "asin"
  | "acos"
  | "atan"
  | "sinh"
  | "cosh"
  | "tanh"
  | "ln"
  | "log"
  | "sqrt"
  | "cbrt"
  | "nroot"
  | "abs";

type Token =
  | { type: "number"; value: number; text: string }
  | { type: "ans" }
  | { type: "constant"; value: "pi" | "e" }
  | { type: "function"; name: FunctionName }
  | { type: "operator"; value: "+" | "-" | "*" | "/" | "^" }
  | { type: "percent" }
  | { type: "factorial" }
  | { type: "paren"; value: "(" | ")" }
  | { type: "comma" }
  | { type: "bar" };

const FUNCTION_TOKENS: Array<{ display: string; name: FunctionName }> = [
  { display: "sin⁻¹", name: "asin" },
  { display: "cos⁻¹", name: "acos" },
  { display: "tan⁻¹", name: "atan" },
  { display: "sinh", name: "sinh" },
  { display: "cosh", name: "cosh" },
  { display: "tanh", name: "tanh" },
  { display: "sin", name: "sin" },
  { display: "cos", name: "cos" },
  { display: "tan", name: "tan" },
  { display: "log", name: "log" },
  { display: "ln", name: "ln" },
  { display: "abs", name: "abs" },
  { display: "ⁿ√", name: "nroot" },
  { display: "∛", name: "cbrt" },
  { display: "√", name: "sqrt" }
];

function isDigit(character: string): boolean {
  return /[0-9]/.test(character);
}

function toRadians(value: number, angleMode: AngleMode): number {
  return angleMode === "DEG" ? (value * Math.PI) / 180 : value;
}

function fromRadians(value: number, angleMode: AngleMode): number {
  return angleMode === "DEG" ? (value * 180) / Math.PI : value;
}

function normalizeExpression(expression: string, lastResult: number | null): string {
  const trimmed = formatExpressionDisplay(expression).trim();

  if (!trimmed) {
    return "";
  }

  if (lastResult === null) {
    return trimmed;
  }

  if (/^[+×÷^]/.test(trimmed)) {
    const operator = trimmed[0];
    const remainder = trimmed.slice(1).trimStart();
    return `${formatExpressionDisplay(formatNumber(lastResult))} ${operator} ${remainder}`;
  }

  if (/^−\s+/.test(trimmed)) {
    const remainder = trimmed.slice(1).trimStart();
    return `${formatExpressionDisplay(formatNumber(lastResult))} − ${remainder}`;
  }

  return trimmed;
}

function readNumber(expression: string, start: number): { token: Token; nextIndex: number } | null {
  let index = start;
  let seenDecimal = false;

  while (index < expression.length) {
    const character = expression[index];

    if (isDigit(character)) {
      index += 1;
      continue;
    }

    if (character === "." && !seenDecimal) {
      seenDecimal = true;
      index += 1;
      continue;
    }

    break;
  }

  const baseText = expression.slice(start, index);

  if (baseText === "." || !baseText) {
    return null;
  }

  let text = baseText;

  if (expression.slice(index, index + 2) === "EE") {
    let exponentIndex = index + 2;

    if (expression[exponentIndex] === "+" || expression[exponentIndex] === "−") {
      exponentIndex += 1;
    }

    const exponentStart = exponentIndex;

    while (exponentIndex < expression.length && isDigit(expression[exponentIndex])) {
      exponentIndex += 1;
    }

    if (exponentStart === exponentIndex) {
      return null;
    }

    text = expression.slice(start, exponentIndex);
    index = exponentIndex;
  }

  const value = Number.parseFloat(text.replace("EE", "e").replace("−", "-"));

  if (!Number.isFinite(value)) {
    return null;
  }

  return {
    token: { type: "number", value, text },
    nextIndex: index
  };
}

function tokenize(expression: string): Token[] | null {
  const tokens: Token[] = [];
  let index = 0;

  while (index < expression.length) {
    const character = expression[index];

    if (/\s/.test(character)) {
      index += 1;
      continue;
    }

    const numberToken = readNumber(expression, index);

    if (numberToken) {
      tokens.push(numberToken.token);
      index = numberToken.nextIndex;
      continue;
    }

    if (expression.slice(index, index + 3) === "ANS") {
      tokens.push({ type: "ans" });
      index += 3;
      continue;
    }

    if (character === "π") {
      tokens.push({ type: "constant", value: "pi" });
      index += 1;
      continue;
    }

    if (character === "e") {
      tokens.push({ type: "constant", value: "e" });
      index += 1;
      continue;
    }

    const matchedFunction = FUNCTION_TOKENS.find((token) => expression.slice(index).startsWith(token.display));

    if (matchedFunction) {
      tokens.push({ type: "function", name: matchedFunction.name });
      index += matchedFunction.display.length;
      continue;
    }

    if (character === "%") {
      tokens.push({ type: "percent" });
      index += 1;
      continue;
    }

    if (character === "!") {
      tokens.push({ type: "factorial" });
      index += 1;
      continue;
    }

    if (character === "(" || character === ")") {
      tokens.push({ type: "paren", value: character });
      index += 1;
      continue;
    }

    if (character === ",") {
      tokens.push({ type: "comma" });
      index += 1;
      continue;
    }

    if (character === "|") {
      tokens.push({ type: "bar" });
      index += 1;
      continue;
    }

    if (character === "+" || character === "−" || character === "×" || character === "÷" || character === "^") {
      tokens.push({
        type: "operator",
        value:
          character === "−"
            ? "-"
            : character === "×"
              ? "*"
              : character === "÷"
                ? "/"
                : (character as "+" | "^")
      });
      index += 1;
      continue;
    }

    return null;
  }

  return tokens;
}

function createError(error: string): EvaluatorResult {
  return { ok: false, error };
}

function factorial(value: number): number {
  if (!Number.isInteger(value) || value < 0) {
    return Number.NaN;
  }

  if (value > 170) {
    return Number.POSITIVE_INFINITY;
  }

  let result = 1;

  for (let index = 2; index <= value; index += 1) {
    result *= index;
  }

  return result;
}

function evaluateFunction(name: FunctionName, value: number, angleMode: AngleMode): number {
  switch (name) {
    case "sin":
      return Math.sin(toRadians(value, angleMode));
    case "cos":
      return Math.cos(toRadians(value, angleMode));
    case "tan":
      return Math.tan(toRadians(value, angleMode));
    case "asin":
      return fromRadians(Math.asin(value), angleMode);
    case "acos":
      return fromRadians(Math.acos(value), angleMode);
    case "atan":
      return fromRadians(Math.atan(value), angleMode);
    case "sinh":
      return Math.sinh(value);
    case "cosh":
      return Math.cosh(value);
    case "tanh":
      return Math.tanh(value);
    case "ln":
      return Math.log(value);
    case "log":
      return Math.log10(value);
    case "sqrt":
      return Math.sqrt(value);
    case "cbrt":
      return Math.cbrt(value);
    case "abs":
      return Math.abs(value);
    case "nroot":
      return Number.NaN;
  }
}

function isImplicitMultiplicationStart(token: Token | undefined): boolean {
  if (!token) {
    return false;
  }

  return (
    token.type === "number" ||
    token.type === "ans" ||
    token.type === "constant" ||
    token.type === "function" ||
    (token.type === "paren" && token.value === "(")
  );
}

export function evaluateExpression(
  expression: string,
  lastResult: number | null,
  angleMode: AngleMode = "DEG"
): EvaluatorResult {
  const resolvedExpression = normalizeExpression(expression, lastResult);

  if (!resolvedExpression) {
    return createError("Enter an expression.");
  }

  const tokens = tokenize(resolvedExpression);

  if (!tokens || tokens.length === 0) {
    return createError("Invalid expression.");
  }

  const tokenList = tokens;
  let index = 0;
  let encounteredDivideByZero = false;

  function peek(offset = 0): Token | undefined {
    return tokenList[index + offset];
  }

  function consume(): Token | undefined {
    const token = tokenList[index];
    index += 1;
    return token;
  }

  function parseExpressionValue(): number | null {
    let value = parseTerm();

    if (value === null) {
      return null;
    }

    while (true) {
      const token = peek();

      if (token?.type !== "operator" || (token.value !== "+" && token.value !== "-")) {
        return value;
      }

      consume();
      const right = parseTerm();

      if (right === null) {
        return null;
      }

      value = token.value === "+" ? value + right : value - right;
    }
  }

  function parseTerm(): number | null {
    let value = parsePower();

    if (value === null) {
      return null;
    }

    while (true) {
      const token = peek();

      if (token?.type === "operator" && (token.value === "*" || token.value === "/")) {
        consume();
        const right = parsePower();

        if (right === null) {
          return null;
        }

        if (token.value === "*") {
          value *= right;
          continue;
        }

        if (right === 0) {
          encounteredDivideByZero = true;
          return Number.NaN;
        }

        value /= right;
        continue;
      }

      if (!isImplicitMultiplicationStart(token)) {
        return value;
      }

      const right = parsePower();

      if (right === null) {
        return null;
      }

      value *= right;
    }
  }

  function parsePower(): number | null {
    let value = parseUnary();

    if (value === null) {
      return null;
    }

    const token = peek();

    if (token?.type !== "operator" || token.value !== "^") {
      return value;
    }

    consume();
    const exponent = parsePower();

    if (exponent === null) {
      return null;
    }

    value = value ** exponent;
    return value;
  }

  function parseUnary(): number | null {
    const token = peek();

    if (token?.type === "operator" && (token.value === "+" || token.value === "-")) {
      consume();
      const value = parseUnary();
      return value === null ? null : token.value === "-" ? -value : value;
    }

    if (token?.type === "function") {
      consume();

      if (token.name === "nroot") {
        const open = consume();

        if (open?.type !== "paren" || open.value !== "(") {
          return null;
        }

        const rootDegree = parseExpressionValue();

        if (rootDegree === null) {
          return null;
        }

        const separator = consume();

        if (separator?.type !== "comma") {
          return null;
        }

        const radicand = parseExpressionValue();

        if (radicand === null) {
          return null;
        }

        const close = consume();

        if (close?.type !== "paren" || close.value !== ")") {
          return null;
        }

        return radicand ** (1 / rootDegree);
      }

      const nextToken = peek();
      let value: number | null;

      if (nextToken?.type === "paren" && nextToken.value === "(") {
        consume();
        value = parseExpressionValue();

        if (value === null) {
          return null;
        }

        const close = consume();

        if (close?.type !== "paren" || close.value !== ")") {
          return null;
        }
      } else {
        value = parseUnary();
      }

      return value === null ? null : evaluateFunction(token.name, value, angleMode);
    }

    return parsePostfix();
  }

  function parsePostfix(): number | null {
    let value = parsePrimary();

    if (value === null) {
      return null;
    }

    while (true) {
      const token = peek();

      if (token?.type === "percent") {
        consume();
        value /= 100;
        continue;
      }

      if (token?.type === "factorial") {
        consume();
        value = factorial(value);
        continue;
      }

      return value;
    }
  }

  function parsePrimary(): number | null {
    const token = consume();

    if (!token) {
      return null;
    }

    if (token.type === "number") {
      return token.value;
    }

    if (token.type === "ans") {
      return lastResult;
    }

    if (token.type === "constant") {
      return token.value === "pi" ? Math.PI : Math.E;
    }

    if (token.type === "paren" && token.value === "(") {
      const value = parseExpressionValue();

      if (value === null) {
        return null;
      }

      const close = consume();
      return close?.type === "paren" && close.value === ")" ? value : null;
    }

    if (token.type === "bar") {
      const value = parseExpressionValue();

      if (value === null) {
        return null;
      }

      const close = consume();
      return close?.type === "bar" ? Math.abs(value) : null;
    }

    return null;
  }

  const value = parseExpressionValue();

  if (value === null || index !== tokenList.length) {
    return createError("Invalid expression.");
  }

  if (!Number.isFinite(value)) {
    return createError(encounteredDivideByZero ? "Cannot divide by zero." : "Invalid expression.");
  }

  return {
    ok: true,
    value,
    resolvedExpression
  };
}
