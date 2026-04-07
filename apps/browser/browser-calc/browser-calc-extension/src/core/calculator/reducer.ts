import type { CalculatorAction } from "./actions";
import { evaluateExpression } from "./evaluator";
import { formatNumber } from "./format";
import { appendHistoryEntry, clearHistory } from "./history";
import { formatExpressionDisplay, sanitizeExpressionWithSelection, sanitizePastedExpression } from "./input";
import type { CalculatorState } from "./types";

type SelectionRange = {
  start: number;
  end: number;
};

type EditResult = {
  expression: string;
  selectionStart: number;
  selectionEnd: number;
};

const TOKEN_PATTERN = /^(?:ANS|[−-]?\d*\.?\d+)(?:%+)?$/;
const OPERATOR_PATTERN = /[+\-*/×÷−]/;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toSelectionRange(state: CalculatorState): SelectionRange {
  return {
    start: Math.min(state.selectionStart, state.selectionEnd),
    end: Math.max(state.selectionStart, state.selectionEnd)
  };
}

function replaceSelection(expression: string, selection: SelectionRange, value: string): EditResult {
  const nextExpression = `${expression.slice(0, selection.start)}${value}${expression.slice(selection.end)}`;
  const cursor = selection.start + value.length;

  return {
    expression: nextExpression,
    selectionStart: cursor,
    selectionEnd: cursor
  };
}

function withSelectionState(state: CalculatorState, expression: string, selectionStart: number, selectionEnd: number): CalculatorState {
  const maxIndex = expression.length;
  const start = clamp(selectionStart, 0, maxIndex);
  const end = clamp(selectionEnd, 0, maxIndex);

  return {
    ...state,
    expression,
    selectionStart: start,
    selectionEnd: end,
    cursorIndex: end
  };
}

function withEditingState(state: CalculatorState, edit: EditResult): CalculatorState {
  return {
    ...withSelectionState(state, edit.expression, edit.selectionStart, edit.selectionEnd),
    result: null,
    errorMessage: null
  };
}

function shouldExpandImplicitChainDraft(expression: string): boolean {
  return /^[+\-−*/×÷]/.test(expression.trimStart());
}

function clearDisplayedResultForEditing(state: CalculatorState): CalculatorState {
  return {
    ...state,
    expression: "",
    cursorIndex: 0,
    selectionStart: 0,
    selectionEnd: 0,
    result: null,
    errorMessage: null
  };
}

function findTokenRange(expression: string, selection: SelectionRange): SelectionRange | null {
  const selectedText = expression.slice(selection.start, selection.end);

  if (selectedText && TOKEN_PATTERN.test(selectedText)) {
    return selection;
  }

  if (selection.start !== selection.end) {
    return null;
  }

  const boundaryIndex = selection.start;
  let start = boundaryIndex;
  let end = boundaryIndex;

  while (start > 0 && /[A-Za-z0-9.%]/.test(expression[start - 1])) {
    start -= 1;
  }

  while (end < expression.length && /[A-Za-z0-9.%]/.test(expression[end])) {
    end += 1;
  }

  if (start === end) {
    return null;
  }

  const previousCharacter = expression[start - 1];

  if (previousCharacter === "−" || previousCharacter === "-") {
    const prefix = expression.slice(0, start - 1);
    const previousNonWhitespace = prefix.match(/\S(?=\s*$)/)?.[0];

    if (!previousNonWhitespace || OPERATOR_PATTERN.test(previousNonWhitespace)) {
      start -= 1;
    }
  }

  const token = expression.slice(start, end);
  return TOKEN_PATTERN.test(token) ? { start, end } : null;
}

function toggleSign(expression: string, selection: SelectionRange): EditResult | null {
  const tokenRange = findTokenRange(expression, selection);

  if (!tokenRange) {
    return replaceSelection(expression, selection, "−");
  }

  const token = expression.slice(tokenRange.start, tokenRange.end);
  const nextToken = token.startsWith("−") || token.startsWith("-") ? token.slice(1) : `−${token}`;

  return {
    expression: `${expression.slice(0, tokenRange.start)}${nextToken}${expression.slice(tokenRange.end)}`,
    selectionStart: tokenRange.start + nextToken.length,
    selectionEnd: tokenRange.start + nextToken.length
  };
}

function applyPercent(expression: string, selection: SelectionRange): EditResult | null {
  const tokenRange = findTokenRange(expression, selection);

  if (!tokenRange) {
    return null;
  }

  const token = expression.slice(tokenRange.start, tokenRange.end);

  if (token.endsWith("%")) {
    return null;
  }

  const nextToken = `${token}%`;

  return {
    expression: `${expression.slice(0, tokenRange.start)}${nextToken}${expression.slice(tokenRange.end)}`,
    selectionStart: tokenRange.start + nextToken.length,
    selectionEnd: tokenRange.start + nextToken.length
  };
}

export function getInitialCalculatorState(): CalculatorState {
  return {
    expression: "",
    cursorIndex: 0,
    selectionStart: 0,
    selectionEnd: 0,
    result: null,
    lastResult: null,
    history: [],
    errorMessage: null
  };
}

export function reduceCalculator(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case "INSERT_CHAR": {
      if (state.result !== null && state.lastResult !== null && shouldExpandImplicitChainDraft(action.value)) {
        const resultPrefix = formatExpressionDisplay(formatNumber(state.lastResult));

        return withEditingState(state, {
          expression: `${resultPrefix}${action.value}`,
          selectionStart: resultPrefix.length + action.value.length,
          selectionEnd: resultPrefix.length + action.value.length
        });
      }

      if (state.result !== null || state.errorMessage !== null) {
        return withEditingState(clearDisplayedResultForEditing(state), {
          expression: action.value,
          selectionStart: action.value.length,
          selectionEnd: action.value.length
        });
      }

      return withEditingState(state, replaceSelection(state.expression, toSelectionRange(state), action.value));
    }
    case "DELETE_CHAR": {
      const selection = toSelectionRange(state);

      if (selection.start !== selection.end) {
        return withEditingState(state, replaceSelection(state.expression, selection, ""));
      }

      if (action.direction === "backward" && selection.start === 0) {
        return state;
      }

      if (action.direction === "forward" && selection.end === state.expression.length) {
        return state;
      }

      const nextSelection =
        action.direction === "backward"
          ? { start: selection.start - 1, end: selection.end }
          : { start: selection.start, end: selection.end + 1 };

      return withEditingState(state, replaceSelection(state.expression, nextSelection, ""));
    }
    case "MOVE_CURSOR":
      return withSelectionState(state, state.expression, action.selectionStart, action.selectionEnd);
    case "SET_EXPRESSION": {
      const sanitized = sanitizeExpressionWithSelection(action.expression, action.selectionStart, action.selectionEnd);

      if (state.result !== null && state.lastResult !== null && shouldExpandImplicitChainDraft(sanitized.expression)) {
        const resultPrefix = formatExpressionDisplay(formatNumber(state.lastResult));

        return {
          ...withSelectionState(
            state,
            `${resultPrefix}${sanitized.expression}`,
            sanitized.selectionStart + resultPrefix.length,
            sanitized.selectionEnd + resultPrefix.length
          ),
          result: null,
          errorMessage: null
        };
      }

      return {
        ...withSelectionState(state, sanitized.expression, sanitized.selectionStart, sanitized.selectionEnd),
        result: null,
        errorMessage: null
      };
    }
    case "PASTE_INPUT": {
      const sanitizedValue = sanitizePastedExpression(action.value);

      if (!sanitizedValue) {
        return state;
      }

      if (state.result !== null && state.lastResult !== null && shouldExpandImplicitChainDraft(sanitizedValue)) {
        const resultPrefix = formatExpressionDisplay(formatNumber(state.lastResult));

        return withEditingState(state, {
          expression: `${resultPrefix}${sanitizedValue}`,
          selectionStart: resultPrefix.length + sanitizedValue.length,
          selectionEnd: resultPrefix.length + sanitizedValue.length
        });
      }

      if (state.result !== null || state.errorMessage !== null) {
        return withEditingState(clearDisplayedResultForEditing(state), {
          expression: sanitizedValue,
          selectionStart: sanitizedValue.length,
          selectionEnd: sanitizedValue.length
        });
      }

      return withEditingState(state, replaceSelection(state.expression, toSelectionRange(state), sanitizedValue));
    }
    case "SET_FROM_HISTORY":
      return {
        ...state,
        expression: action.entry.expression,
        cursorIndex: 0,
        selectionStart: 0,
        selectionEnd: 0,
        result: action.entry.result,
        lastResult: action.entry.result,
        errorMessage: null
      };
    case "TOGGLE_SIGN": {
      const edit = toggleSign(state.expression, toSelectionRange(state));
      return edit ? withEditingState(state, edit) : state;
    }
    case "APPLY_PERCENT": {
      const edit = applyPercent(state.expression, toSelectionRange(state));
      return edit ? withEditingState(state, edit) : state;
    }
    case "EVALUATE": {
      const evaluation = evaluateExpression(state.expression, state.lastResult);

      if (!evaluation.ok) {
        return {
          ...state,
          result: null,
          errorMessage: evaluation.error
        };
      }

      const nextResult = evaluation.value;

      return {
        ...state,
        expression: evaluation.resolvedExpression,
        cursorIndex: 0,
        selectionStart: 0,
        selectionEnd: 0,
        result: nextResult,
        lastResult: nextResult,
        errorMessage: null,
        history: appendHistoryEntry(state.history, {
          expression: evaluation.resolvedExpression,
          result: nextResult,
          timestamp: Date.now()
        })
      };
    }
    case "CLEAR":
      return {
        ...state,
        expression: "",
        cursorIndex: 0,
        selectionStart: 0,
        selectionEnd: 0,
        result: null,
        errorMessage: null
      };
    case "CLEAR_HISTORY":
      return {
        ...state,
        history: clearHistory()
      };
    default:
      return state;
  }
}

export function getCopyValue(state: CalculatorState): string | null {
  const latestResult = state.result ?? state.lastResult;

  if (latestResult === null) {
    return null;
  }

  return formatNumber(latestResult);
}
