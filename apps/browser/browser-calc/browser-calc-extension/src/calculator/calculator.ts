import { ERROR_DISPLAY, normalizeDisplay, parseDisplayValue } from "./format";

export type CalculatorOperator = "+" | "-" | "*" | "/";

export type CalculatorAction =
  | { type: "digit"; digit: string }
  | { type: "decimal" }
  | { type: "operator"; operator: CalculatorOperator }
  | { type: "equals" }
  | { type: "clear" }
  | { type: "backspace" }
  | { type: "toggleSign" }
  | { type: "percent" };

export type CalculatorState = {
  display: string;
  accumulator: number | null;
  pendingOperator: CalculatorOperator | null;
  shouldResetDisplay: boolean;
  error: boolean;
};

export function getInitialCalculatorState(): CalculatorState {
  return {
    display: "0",
    accumulator: null,
    pendingOperator: null,
    shouldResetDisplay: false,
    error: false
  };
}

function applyOperation(left: number, right: number, operator: CalculatorOperator): number {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return right === 0 ? Number.NaN : left / right;
  }
}

function toErrorState(): CalculatorState {
  return {
    display: ERROR_DISPLAY,
    accumulator: null,
    pendingOperator: null,
    shouldResetDisplay: true,
    error: true
  };
}

function clearErrorIfNeeded(state: CalculatorState): CalculatorState {
  if (!state.error) {
    return state;
  }

  return getInitialCalculatorState();
}

function executePending(state: CalculatorState, nextOperator?: CalculatorOperator): CalculatorState {
  const currentValue = parseDisplayValue(state.display);

  if (!Number.isFinite(currentValue)) {
    return toErrorState();
  }

  if (state.pendingOperator === null || state.accumulator === null) {
    return {
      ...state,
      accumulator: currentValue,
      pendingOperator: nextOperator ?? state.pendingOperator,
      shouldResetDisplay: true
    };
  }

  const result = applyOperation(state.accumulator, currentValue, state.pendingOperator);
  const formatted = normalizeDisplay(result);

  if (formatted === ERROR_DISPLAY) {
    return toErrorState();
  }

  return {
    ...state,
    display: formatted,
    accumulator: parseDisplayValue(formatted),
    pendingOperator: nextOperator ?? null,
    shouldResetDisplay: true,
    error: false
  };
}

export function reduceCalculator(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case "clear":
      return getInitialCalculatorState();
    case "digit": {
      const resetState = clearErrorIfNeeded(state);
      const nextDisplay =
        resetState.shouldResetDisplay || resetState.display === "0"
          ? action.digit
          : `${resetState.display}${action.digit}`;

      return {
        ...resetState,
        display: nextDisplay,
        shouldResetDisplay: false,
        error: false
      };
    }
    case "decimal": {
      const resetState = clearErrorIfNeeded(state);

      if (resetState.shouldResetDisplay) {
        return {
          ...resetState,
          display: "0.",
          shouldResetDisplay: false,
          error: false
        };
      }

      if (resetState.display.includes(".")) {
        return resetState;
      }

      return {
        ...resetState,
        display: `${resetState.display}.`
      };
    }
    case "operator": {
      const resetState = clearErrorIfNeeded(state);

      if (resetState.shouldResetDisplay && resetState.accumulator !== null) {
        return {
          ...resetState,
          pendingOperator: action.operator
        };
      }

      return executePending(resetState, action.operator);
    }
    case "equals": {
      if (state.pendingOperator === null) {
        return state;
      }

      return executePending(state);
    }
    case "backspace": {
      const resetState = clearErrorIfNeeded(state);
      if (resetState.shouldResetDisplay) {
        return resetState;
      }

      if (resetState.display.length <= 1 || (resetState.display.length === 2 && resetState.display.startsWith("-"))) {
        return {
          ...resetState,
          display: "0"
        };
      }

      return {
        ...resetState,
        display: resetState.display.slice(0, -1)
      };
    }
    case "toggleSign": {
      const resetState = clearErrorIfNeeded(state);
      if (resetState.display === "0" || resetState.display === "0.") {
        return resetState;
      }

      return {
        ...resetState,
        display: resetState.display.startsWith("-") ? resetState.display.slice(1) : `-${resetState.display}`
      };
    }
    case "percent": {
      const resetState = clearErrorIfNeeded(state);
      const value = parseDisplayValue(resetState.display);
      const formatted = normalizeDisplay(value / 100);

      if (formatted === ERROR_DISPLAY) {
        return toErrorState();
      }

      return {
        ...resetState,
        display: formatted,
        shouldResetDisplay: false,
        error: false
      };
    }
    default:
      return state;
  }
}
