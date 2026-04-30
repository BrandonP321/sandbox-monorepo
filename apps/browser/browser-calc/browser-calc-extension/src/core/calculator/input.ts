const RAW_OPERATOR_GLYPHS = new Map([
  ["×", "*"],
  ["÷", "/"],
  ["−", "-"],
  ["–", "-"],
  ["—", "-"]
]);

const DISPLAY_OPERATOR_GLYPHS = new Map([
  ["*", "×"],
  ["/", "÷"],
  ["-", "−"]
]);

const TOKEN_ALIASES = [
  { inputs: ["sin⁻¹", "asin"], display: "sin⁻¹" },
  { inputs: ["cos⁻¹", "acos"], display: "cos⁻¹" },
  { inputs: ["tan⁻¹", "atan"], display: "tan⁻¹" },
  { inputs: ["sinh"], display: "sinh" },
  { inputs: ["cosh"], display: "cosh" },
  { inputs: ["tanh"], display: "tanh" },
  { inputs: ["sqrt", "√"], display: "√" },
  { inputs: ["cbrt", "∛"], display: "∛" },
  { inputs: ["nthroot", "nroot", "root", "ⁿ√"], display: "ⁿ√" },
  { inputs: ["ans"], display: "ANS" },
  { inputs: ["sin"], display: "sin" },
  { inputs: ["cos"], display: "cos" },
  { inputs: ["tan"], display: "tan" },
  { inputs: ["log"], display: "log" },
  { inputs: ["ln"], display: "ln" },
  { inputs: ["abs"], display: "abs" },
  { inputs: ["pi"], display: "π" },
  { inputs: ["ee"], display: "EE" }
]
  .flatMap((alias) =>
    alias.inputs.map((input) => ({ input, display: alias.display }))
  )
  .sort((left, right) => right.input.length - left.input.length);

export type SanitizedSelection = {
  expression: string;
  selectionStart: number;
  selectionEnd: number;
};

export function normalizeExpressionOperators(value: string): string {
  return Array.from(
    value,
    (character) => RAW_OPERATOR_GLYPHS.get(character) ?? character
  ).join("");
}

export function formatExpressionDisplay(value: string): string {
  return Array.from(
    value,
    (character) => DISPLAY_OPERATOR_GLYPHS.get(character) ?? character
  ).join("");
}

function matchAlias(
  value: string,
  index: number
): { display: string; length: number } | null {
  const remainder = value.slice(index);

  for (const alias of TOKEN_ALIASES) {
    if (remainder.toLowerCase().startsWith(alias.input.toLowerCase())) {
      return {
        display: alias.display,
        length: alias.input.length
      };
    }
  }

  return null;
}

function shouldTreatAsScientificExponent(
  result: string,
  remainder: string
): boolean {
  if (!/[0-9.]$/.test(result)) {
    return false;
  }

  return /^[eE][+-]?\d/.test(remainder);
}

function sanitizeExpression(
  value: string,
  keepUnmatchedLetters: boolean
): string {
  const normalized = normalizeExpressionOperators(value);
  let result = "";

  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index];

    if (shouldTreatAsScientificExponent(result, normalized.slice(index))) {
      result += "EE";
      continue;
    }

    const alias = matchAlias(normalized, index);

    if (alias) {
      result += alias.display;
      index += alias.length - 1;
      continue;
    }

    if (/[0-9+\-*/.^%,!(),|\s]/.test(character)) {
      result += character;
      continue;
    }

    if (character === ",") {
      result += character;
      continue;
    }

    if (/^[πe√∛ⁿ]$/.test(character)) {
      result += character;
      continue;
    }

    if (/[A-Za-z]/.test(character) && keepUnmatchedLetters) {
      result += character.toLowerCase();
    }
  }

  return formatExpressionDisplay(result);
}

export function sanitizeExpressionDraft(value: string): string {
  return sanitizeExpression(value, true);
}

export function sanitizePastedExpression(value: string): string {
  return sanitizeExpression(value, false);
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
    selectionStart: sanitizeExpressionDraft(expression.slice(0, safeStart))
      .length,
    selectionEnd: sanitizeExpressionDraft(expression.slice(0, safeEnd)).length
  };
}
