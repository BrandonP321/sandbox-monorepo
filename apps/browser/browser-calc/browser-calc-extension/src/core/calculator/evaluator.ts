import { formatNumber } from "./format";
import { formatExpressionDisplay, normalizeExpressionOperators } from "./input";
import type { EvaluatorResult } from "./types";

type Token =
  | { type: "number"; value: number; text: string }
  | { type: "ans" }
  | { type: "operator"; value: "+" | "-" | "*" | "/" }
  | { type: "percent" };

function isDigit(character: string): boolean {
  return /[0-9]/.test(character);
}

function normalizeExpression(expression: string, lastResult: number | null): string {
  const trimmed = normalizeExpressionOperators(expression).trim();

  if (!trimmed) {
    return "";
  }

  if (lastResult === null) {
    return trimmed;
  }

  if (/^[+*/]/.test(trimmed)) {
    const operator = trimmed[0];
    const remainder = trimmed.slice(1).trimStart();
    return `${formatNumber(lastResult)} ${operator} ${remainder}`;
  }

  if (/^-\s+/.test(trimmed)) {
    const remainder = trimmed.slice(1).trimStart();
    return `${formatNumber(lastResult)} - ${remainder}`;
  }

  return trimmed;
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

    if (isDigit(character) || character === ".") {
      const start = index;
      let seenDecimal = character === ".";
      index += 1;

      while (index < expression.length) {
        const nextCharacter = expression[index];

        if (isDigit(nextCharacter)) {
          index += 1;
          continue;
        }

        if (nextCharacter === "." && !seenDecimal) {
          seenDecimal = true;
          index += 1;
          continue;
        }

        break;
      }

      const text = expression.slice(start, index);

      if (text === ".") {
        return null;
      }

      const value = Number.parseFloat(text);

      if (!Number.isFinite(value)) {
        return null;
      }

      tokens.push({ type: "number", value, text });
      continue;
    }

    const ansToken = expression.slice(index, index + 3);

    if (/^ANS$/i.test(ansToken)) {
      tokens.push({ type: "ans" });
      index += 3;
      continue;
    }

    if (character === "%") {
      tokens.push({ type: "percent" });
      index += 1;
      continue;
    }

    if (/^[+\-*/]$/.test(character)) {
      tokens.push({ type: "operator", value: character as "+" | "-" | "*" | "/" });
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

export function evaluateExpression(expression: string, lastResult: number | null): EvaluatorResult {
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

  function peek(): Token | undefined {
    return tokenList[index];
  }

  function consume(): Token | undefined {
    const token = tokenList[index];
    index += 1;
    return token;
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

    return null;
  }

  function parseUnary(): number | null {
    const token = peek();

    if (token?.type === "operator" && token.value === "-") {
      consume();
      const value = parseUnary();
      return value === null ? null : -value;
    }

    return parsePrimary();
  }

  function parseFactor(): number | null {
    let value = parseUnary();

    if (value === null) {
      return null;
    }

    while (peek()?.type === "percent") {
      consume();
      value /= 100;
    }

    return value;
  }

  function parseTerm(): number | null {
    let value = parseFactor();

    if (value === null) {
      return null;
    }

    while (true) {
      const token = peek();

      if (token?.type !== "operator" || (token.value !== "*" && token.value !== "/")) {
        return value;
      }

      consume();
      const right = parseFactor();

      if (right === null) {
        return null;
      }

      if (token.value === "*") {
        value *= right;
      } else {
        if (right === 0) {
          return Number.NaN;
        }

        value /= right;
      }
    }
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

  const value = parseExpressionValue();

  if (value === null || index !== tokenList.length) {
    return createError("Invalid expression.");
  }

  if (!Number.isFinite(value)) {
    return createError("Cannot divide by zero.");
  }

  return {
    ok: true,
    value,
    resolvedExpression: formatExpressionDisplay(resolvedExpression)
  };
}
