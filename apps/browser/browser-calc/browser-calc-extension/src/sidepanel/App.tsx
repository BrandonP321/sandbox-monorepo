import { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import type {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  MouseEvent,
  SyntheticEvent
} from "react";
import {
  formatNumber,
  getCopyValue,
  getInitialCalculatorState,
  reduceCalculator,
  type CalculatorAction
} from "../core/calculator";
import type { HistoryEntry } from "../core/calculator";
import styles from "./App.module.scss";

type ButtonConfig = {
  label: string;
  action: CalculatorAction;
  variant: "default" | "operator" | "utility";
};

const BUTTONS: ButtonConfig[] = [
  { label: "C", action: { type: "CLEAR" }, variant: "utility" },
  { label: "ANS", action: { type: "INSERT_CHAR", value: "ANS" }, variant: "utility" },
  { label: "±", action: { type: "TOGGLE_SIGN" }, variant: "utility" },
  { label: "÷", action: { type: "INSERT_CHAR", value: "÷" }, variant: "operator" },
  { label: "7", action: { type: "INSERT_CHAR", value: "7" }, variant: "default" },
  { label: "8", action: { type: "INSERT_CHAR", value: "8" }, variant: "default" },
  { label: "9", action: { type: "INSERT_CHAR", value: "9" }, variant: "default" },
  { label: "×", action: { type: "INSERT_CHAR", value: "×" }, variant: "operator" },
  { label: "4", action: { type: "INSERT_CHAR", value: "4" }, variant: "default" },
  { label: "5", action: { type: "INSERT_CHAR", value: "5" }, variant: "default" },
  { label: "6", action: { type: "INSERT_CHAR", value: "6" }, variant: "default" },
  { label: "−", action: { type: "INSERT_CHAR", value: "−" }, variant: "operator" },
  { label: "1", action: { type: "INSERT_CHAR", value: "1" }, variant: "default" },
  { label: "2", action: { type: "INSERT_CHAR", value: "2" }, variant: "default" },
  { label: "3", action: { type: "INSERT_CHAR", value: "3" }, variant: "default" },
  { label: "+", action: { type: "INSERT_CHAR", value: "+" }, variant: "operator" },
  { label: "0", action: { type: "INSERT_CHAR", value: "0" }, variant: "default" },
  { label: ".", action: { type: "INSERT_CHAR", value: "." }, variant: "default" },
  { label: "%", action: { type: "APPLY_PERCENT" }, variant: "utility" },
  { label: "⌫", action: { type: "DELETE_CHAR", direction: "backward" }, variant: "utility" },
  { label: "=", action: { type: "EVALUATE" }, variant: "operator" }
];

function getButtonClassName(variant: ButtonConfig["variant"]): string | undefined {
  if (variant === "operator") {
    return styles.operator;
  }

  if (variant === "utility") {
    return styles.utility;
  }

  return undefined;
}

function getDisplayValue(errorMessage: string | null, result: number | null): string {
  if (errorMessage) {
    return errorMessage;
  }

  return result !== null ? formatNumber(result) : "";
}

function describeAction(action: CalculatorAction): string {
  switch (action.type) {
    case "INSERT_CHAR":
      return `insert ${action.value}`;
    case "DELETE_CHAR":
      return action.direction === "backward" ? "backspace" : "delete";
    case "CLEAR":
      return "clear expression";
    case "TOGGLE_SIGN":
      return "toggle sign";
    case "APPLY_PERCENT":
      return "apply percent";
    case "EVALUATE":
      return "evaluate expression";
    default:
      return action.type.toLowerCase().replaceAll("_", " ");
  }
}

function getHistoryAriaLabel(entry: HistoryEntry): string {
  return `Use history result ${formatNumber(entry.result)} from ${entry.expression}`;
}

async function writeClipboardText(value: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    return;
  }

  await navigator.clipboard.writeText(value);
}

export default function App() {
  const [state, dispatch] = useReducer(reduceCalculator, undefined, getInitialCalculatorState);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayValue = getDisplayValue(state.errorMessage, state.result);
  const copyValue = getCopyValue(state);
  const hasDisplayResult = state.result !== null || state.errorMessage !== null;
  const inputValue = hasDisplayResult ? "" : state.expression;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isHistoryOpen) {
      return;
    }

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setIsHistoryOpen(false);
      inputRef.current?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isHistoryOpen]);

  useLayoutEffect(() => {
    const input = inputRef.current;

    if (!input || document.activeElement !== input) {
      return;
    }

    const targetSelectionStart = hasDisplayResult ? 0 : state.selectionStart;
    const targetSelectionEnd = hasDisplayResult ? 0 : state.selectionEnd;

    if (input.selectionStart === targetSelectionStart && input.selectionEnd === targetSelectionEnd) {
      return;
    }

    input.setSelectionRange(targetSelectionStart, targetSelectionEnd);
  }, [hasDisplayResult, state.expression, state.selectionStart, state.selectionEnd]);

  function syncSelectionFromInput(input: HTMLInputElement) {
    dispatch({
      type: "MOVE_CURSOR",
      selectionStart: input.selectionStart ?? 0,
      selectionEnd: input.selectionEnd ?? 0
    });
  }

  function refocusInput() {
    inputRef.current?.focus();
  }

  function handleInsertAction(value: string) {
    const input = inputRef.current;

    if (!input) {
      dispatch({ type: "INSERT_CHAR", value });
      refocusInput();
      return;
    }

    const selectionStart = input.selectionStart ?? input.value.length;
    const selectionEnd = input.selectionEnd ?? input.value.length;
    const nextExpression = `${input.value.slice(0, selectionStart)}${value}${input.value.slice(selectionEnd)}`;
    const nextCursorIndex = selectionStart + value.length;

    dispatch({
      type: "SET_EXPRESSION",
      expression: nextExpression,
      selectionStart: nextCursorIndex,
      selectionEnd: nextCursorIndex
    });
    refocusInput();
  }

  function handleAction(action: CalculatorAction) {
    if (action.type === "INSERT_CHAR") {
      handleInsertAction(action.value);
      return;
    }

    if (hasDisplayResult && action.type !== "EVALUATE" && action.type !== "CLEAR") {
      dispatch({ type: "CLEAR" });
    }

    dispatch(action);
    refocusInput();
  }

  function handleMouseDown(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const { key, ctrlKey, metaKey, altKey, currentTarget } = event;

    if ((metaKey || ctrlKey) && key.toLowerCase() === "c") {
      if (currentTarget.selectionStart !== currentTarget.selectionEnd || !copyValue) {
        return;
      }

      event.preventDefault();
      void writeClipboardText(copyValue);
      return;
    }

    if (metaKey || ctrlKey || altKey) {
      return;
    }

    if (key === "Enter" || key === "=") {
      event.preventDefault();
      dispatch({ type: "EVALUATE" });
      return;
    }

    if (key === "Escape") {
      event.preventDefault();

      if (isHistoryOpen) {
        setIsHistoryOpen(false);
        return;
      }

      dispatch({ type: "CLEAR" });
      return;
    }

    if (key === "%") {
      event.preventDefault();
      syncSelectionFromInput(currentTarget);
      dispatch({ type: "APPLY_PERCENT" });
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    dispatch({
      type: "SET_EXPRESSION",
      expression: event.currentTarget.value,
      selectionStart: event.currentTarget.selectionStart ?? event.currentTarget.value.length,
      selectionEnd: event.currentTarget.selectionEnd ?? event.currentTarget.value.length
    });
  }

  function handleSelect(event: SyntheticEvent<HTMLInputElement>) {
    syncSelectionFromInput(event.currentTarget);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    syncSelectionFromInput(event.currentTarget);
    dispatch({
      type: "PASTE_INPUT",
      value: event.clipboardData.getData("text")
    });
  }

  function handleCopy(event: ClipboardEvent<HTMLInputElement>) {
    const hasSelection = event.currentTarget.selectionStart !== event.currentTarget.selectionEnd;

    if (hasSelection || !copyValue) {
      return;
    }

    event.preventDefault();

    if (event.clipboardData) {
      event.clipboardData.setData("text/plain", copyValue);
      return;
    }

    void writeClipboardText(copyValue);
  }

  function handleHistoryClick(entry: HistoryEntry) {
    dispatch({
      type: "SET_FROM_HISTORY",
      entry
    });
    setIsHistoryOpen(false);
    refocusInput();
  }

  return (
    <main className={styles.app}>
      <section className={styles.calculator} aria-label="Calculator">
        <header className={styles.header}>
          <div className={styles.headerBar}>
            <button
              type="button"
              className={styles.historyButton}
              aria-label="open history"
              aria-haspopup="dialog"
              aria-expanded={isHistoryOpen}
              onMouseDown={handleMouseDown}
              onClick={() => setIsHistoryOpen(true)}
            >
              History
            </button>

            <button
              type="button"
              className={styles.copyButton}
              onMouseDown={handleMouseDown}
              onClick={() => {
                if (copyValue) {
                  void writeClipboardText(copyValue);
                }

                refocusInput();
              }}
              disabled={!copyValue}
            >
              Copy
            </button>
          </div>

          <div className={styles.displayPanel}>
            <input
              ref={inputRef}
              id="calculator-expression"
              className={[styles.expressionInput, hasDisplayResult ? styles.expressionInputHidden : ""].join(" ")}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder={hasDisplayResult ? "" : "0"}
              aria-label="Expression input"
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onSelect={handleSelect}
              onPaste={handlePaste}
              onCopy={handleCopy}
            />

            {hasDisplayResult ? (
              <div className={styles.displayOverlay} aria-live="polite">
                <span className={styles.calculationPreview} data-testid="calculation-preview">
                  {state.expression || "0"}
                </span>
                <output
                  className={state.errorMessage ? styles.displayError : styles.displayResult}
                  data-testid="result-value"
                >
                  {displayValue}
                </output>
              </div>
            ) : null}
          </div>
        </header>

        <div className={styles.keypad}>
          {BUTTONS.map((button) => (
            <button
              type="button"
              key={button.label}
              className={[styles.key, getButtonClassName(button.variant)].filter(Boolean).join(" ")}
              aria-label={describeAction(button.action)}
              onMouseDown={handleMouseDown}
              onClick={() => handleAction(button.action)}
            >
              {button.label}
            </button>
          ))}
        </div>
      </section>

      {isHistoryOpen ? (
        <div className={styles.historyOverlay} role="presentation" onClick={() => setIsHistoryOpen(false)}>
          <section
            className={styles.historyDialog}
            role="dialog"
            aria-modal="false"
            aria-label="Calculation history"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.historyHeader}>
              <h2 className={styles.historyTitle}>History</h2>
              <div className={styles.historyActions}>
                <button
                  type="button"
                  className={styles.clearHistoryButton}
                  onMouseDown={handleMouseDown}
                  onClick={() => dispatch({ type: "CLEAR_HISTORY" })}
                  disabled={state.history.length === 0}
                >
                  Clear history
                </button>
                <button
                  type="button"
                  className={styles.closeHistoryButton}
                  onMouseDown={handleMouseDown}
                  onClick={() => {
                    setIsHistoryOpen(false);
                    refocusInput();
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            <div className={styles.historyList}>
              {state.history.length === 0 ? (
                <p className={styles.historyEmpty}>No calculations yet.</p>
              ) : (
                state.history.map((entry) => (
                  <button
                    type="button"
                    key={`${entry.timestamp}-${entry.expression}`}
                    className={styles.historyItem}
                    aria-label={getHistoryAriaLabel(entry)}
                    onMouseDown={handleMouseDown}
                    onClick={() => handleHistoryClick(entry)}
                  >
                    <span className={styles.historyExpression}>{entry.expression}</span>
                    <span className={styles.historyResult}>{formatNumber(entry.result)}</span>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
