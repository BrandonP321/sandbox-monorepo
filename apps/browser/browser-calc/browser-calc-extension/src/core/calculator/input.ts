const RAW_OPERATOR_GLYPHS = new Map([
  ["×", "*"],
  ["÷", "/"],
  ["−", "-"]
]);

const DISPLAY_OPERATOR_GLYPHS = new Map([
  ["*", "×"],
  ["/", "÷"],
  ["-", "−"]
]);

export type SanitizedSelection = {
  expression: string;
  selectionStart: number;
  selectionEnd: number;
};

export function normalizeExpressionOperators(value: string): string {
  return Array.from(value, (character) => RAW_OPERATOR_GLYPHS.get(character) ?? character).join("");
}

export function formatExpressionDisplay(value: string): string {
  return Array.from(value, (character) => DISPLAY_OPERATOR_GLYPHS.get(character) ?? character).join("");
}

export function sanitizeExpressionDraft(value: string): string {
  const normalized = normalizeExpressionOperators(value);
  let result = "";

  for (const character of normalized) {
    if (/[0-9+\-*/.%\s]/.test(character)) {
      result += character;
      continue;
    }

    if (/[ans]/i.test(character)) {
      result += character.toUpperCase();
    }
  }

  return formatExpressionDisplay(result);
}

export function sanitizePastedExpression(value: string): string {
  const normalized = normalizeExpressionOperators(value);
  let result = "";

  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index];

    if (/[0-9+\-*/.%\s]/.test(character)) {
      result += character;
      continue;
    }

    const nextToken = normalized.slice(index, index + 3);

    if (/^ans$/i.test(nextToken)) {
      result += "ANS";
      index += 2;
    }
  }

  return formatExpressionDisplay(result);
}

export function sanitizeExpressionWithSelection(
  expression: string,
  selectionStart: number,
  selectionEnd: number
): SanitizedSelection {
  const safeStart = Math.max(0, selectionStart);
  const safeEnd = Math.max(safeStart, selectionEnd);
  const sanitizedExpression = sanitizeExpressionDraft(expression);

  return {
    expression: sanitizedExpression,
    selectionStart: sanitizeExpressionDraft(expression.slice(0, safeStart)).length,
    selectionEnd: sanitizeExpressionDraft(expression.slice(0, safeEnd)).length
  };
}
