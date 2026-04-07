import { Fragment, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import type {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  SyntheticEvent
} from "react";
import {
  formatExpressionDisplay,
  formatNumber,
  getCopyValue,
  getInitialCalculatorState,
  reduceCalculator,
  type CalculatorAction
} from "../core/calculator";
import type { HistoryEntry } from "../core/calculator";
import styles from "./App.module.scss";

type ButtonVariant = "default" | "operator" | "utility" | "mode";

type ButtonConfig = {
  label: string;
  ariaLabel: string;
  variant: ButtonVariant;
  isActive?: boolean;
  onClick: () => void;
};

type ExpressionEdit = {
  expression: string;
  selectionStart: number;
  selectionEnd: number;
};

type SelectionContext = ExpressionEdit;

function getButtonClassName(variant: ButtonVariant, isActive = false): string[] {
  const classNames = [styles.key];

  if (variant === "operator") {
    classNames.push(styles.operator);
  } else if (variant === "utility") {
    classNames.push(styles.utility);
  } else if (variant === "mode") {
    classNames.push(styles.modeButton);
  }

  if (isActive) {
    classNames.push(styles.activeKey);
  }

  return classNames;
}

function getDisplayValue(errorMessage: string | null, result: number | null): string {
  if (errorMessage) {
    return errorMessage;
  }

  return result !== null ? formatNumber(result) : "";
}

function getHistoryAriaLabel(entry: HistoryEntry): string {
  return `Use history result ${formatNumber(entry.result)} from ${entry.expression}`;
}

function needsGrouping(expression: string): boolean {
  const trimmed = expression.trim();

  if (!trimmed) {
    return false;
  }

  if ((trimmed.startsWith("(") && trimmed.endsWith(")")) || (trimmed.startsWith("|") && trimmed.endsWith("|"))) {
    return false;
  }

  return /[+\-−×÷^,\s]/.test(trimmed);
}

function readBalancedSegment(expression: string, start: number, openCharacter: string, closeCharacter: string): number {
  let depth = 0;

  for (let index = start; index < expression.length; index += 1) {
    const character = expression[index];

    if (character === openCharacter) {
      depth += 1;
    } else if (character === closeCharacter) {
      depth -= 1;

      if (depth === 0) {
        return index + 1;
      }
    }
  }

  return expression.length;
}

function readExponentEnd(expression: string, start: number): number {
  let index = start;

  if (expression[index] === "+" || expression[index] === "−") {
    index += 1;
  }

  while (index < expression.length) {
    const character = expression[index];

    if (character === "(") {
      index = readBalancedSegment(expression, index, "(", ")");
      continue;
    }

    if (character === "|") {
      index += 1;

      while (index < expression.length && expression[index] !== "|") {
        index += 1;
      }

      if (expression[index] === "|") {
        index += 1;
      }

      continue;
    }

    if (/[+\-−×÷,\s)]/.test(character)) {
      break;
    }

    index += 1;
  }

  return index;
}

function renderExpressionMarkup(expression: string) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  while (cursor < expression.length) {
    const exponentIndex = expression.indexOf("^", cursor);

    if (exponentIndex === -1) {
      nodes.push(<Fragment key={`text-${key}`}>{expression.slice(cursor)}</Fragment>);
      break;
    }

    if (exponentIndex > cursor) {
      nodes.push(<Fragment key={`text-${key}`}>{expression.slice(cursor, exponentIndex)}</Fragment>);
      key += 1;
    }

    const exponentStart = exponentIndex + 1;
    const exponentEnd = readExponentEnd(expression, exponentStart);
    const exponentText = expression.slice(exponentStart, exponentEnd);

    if (!exponentText) {
      nodes.push(<Fragment key={`caret-${key}`}>^</Fragment>);
      cursor = exponentStart;
      key += 1;
      continue;
    }

    nodes.push(
      <span key={`exp-${key}`} className={styles.exponentText}>
        {exponentText}
      </span>
    );

    cursor = exponentEnd;
    key += 1;
  }

  return nodes;
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
  const [isScientificVisible, setIsScientificVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayValue = getDisplayValue(state.errorMessage, state.result);
  const copyValue = getCopyValue(state);
  const hasDisplayResult = state.result !== null || state.errorMessage !== null;
  const inputValue = hasDisplayResult ? "" : state.expression;
  const memoryBadge = state.memoryValue !== null ? `M ${formatNumber(state.memoryValue)}` : "M off";

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

  function refocusInput() {
    inputRef.current?.focus();
  }

  function syncSelectionFromInput(input: HTMLInputElement) {
    dispatch({
      type: "MOVE_CURSOR",
      selectionStart: input.selectionStart ?? 0,
      selectionEnd: input.selectionEnd ?? 0
    });
  }

  function getSelectionContext(mode: "selection" | "cursor"): SelectionContext {
    if (hasDisplayResult && state.lastResult !== null) {
      const expression = formatExpressionDisplay(formatNumber(state.lastResult));

      return mode === "selection"
        ? {
            expression,
            selectionStart: 0,
            selectionEnd: expression.length
          }
        : {
            expression,
            selectionStart: expression.length,
            selectionEnd: expression.length
          };
    }

    const input = inputRef.current;
    const expression = input?.value ?? state.expression;
    const selectionStart = input?.selectionStart ?? state.selectionStart;
    const selectionEnd = input?.selectionEnd ?? state.selectionEnd;

    return {
      expression,
      selectionStart,
      selectionEnd
    };
  }

  function commitExpressionEdit(edit: ExpressionEdit) {
    dispatch({
      type: "SET_EXPRESSION",
      expression: edit.expression,
      selectionStart: edit.selectionStart,
      selectionEnd: edit.selectionEnd
    });
    refocusInput();
  }

  function insertSnippet(text: string, cursorOffset = text.length, mode: "selection" | "cursor" = "cursor") {
    const context = getSelectionContext(mode);
    const selectionStart = Math.min(context.selectionStart, context.selectionEnd);
    const selectionEnd = Math.max(context.selectionStart, context.selectionEnd);
    const expression = `${context.expression.slice(0, selectionStart)}${text}${context.expression.slice(selectionEnd)}`;
    const cursor = selectionStart + cursorOffset;

    commitExpressionEdit({
      expression,
      selectionStart: cursor,
      selectionEnd: cursor
    });
  }

  function wrapSelection(prefix: string, suffix: string, placeholder = "") {
    const context = getSelectionContext("selection");
    const selectionStart = Math.min(context.selectionStart, context.selectionEnd);
    const selectionEnd = Math.max(context.selectionStart, context.selectionEnd);
    const selectedText = context.expression.slice(selectionStart, selectionEnd);
    const content = selectedText || placeholder;
    const expression = `${context.expression.slice(0, selectionStart)}${prefix}${content}${suffix}${context.expression.slice(selectionEnd)}`;
    const cursor = selectedText ? selectionStart + prefix.length + content.length + suffix.length : selectionStart + prefix.length;

    commitExpressionEdit({
      expression,
      selectionStart: cursor,
      selectionEnd: cursor
    });
  }

  function applyPostfix(postfix: string) {
    const context = getSelectionContext("selection");
    const selectionStart = Math.min(context.selectionStart, context.selectionEnd);
    const selectionEnd = Math.max(context.selectionStart, context.selectionEnd);
    const selectedText = context.expression.slice(selectionStart, selectionEnd);

    if (selectedText) {
      const groupedSelection = needsGrouping(selectedText) ? `(${selectedText})` : selectedText;
      const expression = `${context.expression.slice(0, selectionStart)}${groupedSelection}${postfix}${context.expression.slice(selectionEnd)}`;
      const cursor = selectionStart + groupedSelection.length + postfix.length;

      commitExpressionEdit({
        expression,
        selectionStart: cursor,
        selectionEnd: cursor
      });
      return;
    }

    insertSnippet(postfix);
  }

  function insertNthRoot() {
    const context = getSelectionContext("selection");
    const selectionStart = Math.min(context.selectionStart, context.selectionEnd);
    const selectionEnd = Math.max(context.selectionStart, context.selectionEnd);
    const selectedText = context.expression.slice(selectionStart, selectionEnd);
    const radicand = selectedText ? `,${selectedText}` : ",";
    const snippet = `ⁿ√(${radicand})`;
    const expression = `${context.expression.slice(0, selectionStart)}${snippet}${context.expression.slice(selectionEnd)}`;
    const cursor = selectionStart + "ⁿ√(".length;

    commitExpressionEdit({
      expression,
      selectionStart: cursor,
      selectionEnd: cursor
    });
  }

  function applyEditAction(action: CalculatorAction) {
    if (hasDisplayResult && state.lastResult !== null) {
      const expression = formatExpressionDisplay(formatNumber(state.lastResult));

      dispatch({
        type: "SET_EXPRESSION",
        expression,
        selectionStart: expression.length,
        selectionEnd: expression.length
      });
    }

    dispatch(action);
    refocusInput();
  }

  function handleInsertAction(value: string) {
    insertSnippet(value, value.length, "selection");
  }

  function handleAction(action: CalculatorAction) {
    if (action.type === "INSERT_CHAR") {
      handleInsertAction(action.value);
      return;
    }

    if (action.type === "TOGGLE_SIGN" || action.type === "APPLY_PERCENT" || action.type === "DELETE_CHAR") {
      applyEditAction(action);
      return;
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
      applyEditAction({ type: "APPLY_PERCENT" });
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

  const scientificButtons: ButtonConfig[] = [
    { label: "sin", ariaLabel: "insert sine", variant: "utility", onClick: () => wrapSelection("sin(", ")") },
    { label: "cos", ariaLabel: "insert cosine", variant: "utility", onClick: () => wrapSelection("cos(", ")") },
    { label: "tan", ariaLabel: "insert tangent", variant: "utility", onClick: () => wrapSelection("tan(", ")") },
    { label: "sin⁻¹", ariaLabel: "insert inverse sine", variant: "utility", onClick: () => wrapSelection("sin⁻¹(", ")") },
    { label: "cos⁻¹", ariaLabel: "insert inverse cosine", variant: "utility", onClick: () => wrapSelection("cos⁻¹(", ")") },
    { label: "tan⁻¹", ariaLabel: "insert inverse tangent", variant: "utility", onClick: () => wrapSelection("tan⁻¹(", ")") },
    { label: "sinh", ariaLabel: "insert hyperbolic sine", variant: "utility", onClick: () => wrapSelection("sinh(", ")") },
    { label: "cosh", ariaLabel: "insert hyperbolic cosine", variant: "utility", onClick: () => wrapSelection("cosh(", ")") },
    { label: "tanh", ariaLabel: "insert hyperbolic tangent", variant: "utility", onClick: () => wrapSelection("tanh(", ")") },
    { label: "ln", ariaLabel: "insert natural logarithm", variant: "utility", onClick: () => wrapSelection("ln(", ")") },
    { label: "log", ariaLabel: "insert base 10 logarithm", variant: "utility", onClick: () => wrapSelection("log(", ")") },
    { label: "EE", ariaLabel: "insert exponent notation", variant: "utility", onClick: () => handleInsertAction("EE") },
    { label: "e^x", ariaLabel: "raise e to a power", variant: "utility", onClick: () => wrapSelection("e^(", ")") },
    { label: "10^x", ariaLabel: "raise ten to a power", variant: "utility", onClick: () => wrapSelection("10^(", ")") },
    { label: "x^y", ariaLabel: "insert exponent operator", variant: "utility", onClick: () => insertSnippet("^") },
    { label: "x²", ariaLabel: "square selection", variant: "utility", onClick: () => applyPostfix("^2") },
    { label: "x³", ariaLabel: "cube selection", variant: "utility", onClick: () => applyPostfix("^3") },
    { label: "x!", ariaLabel: "apply factorial", variant: "utility", onClick: () => applyPostfix("!") },
    { label: "√", ariaLabel: "insert square root", variant: "utility", onClick: () => wrapSelection("√(", ")") },
    { label: "∛", ariaLabel: "insert cube root", variant: "utility", onClick: () => wrapSelection("∛(", ")") },
    { label: "ⁿ√x", ariaLabel: "insert nth root", variant: "utility", onClick: () => insertNthRoot() },
    { label: "1/x", ariaLabel: "insert reciprocal", variant: "utility", onClick: () => wrapSelection("1÷(", ")") },
    { label: "|x|", ariaLabel: "insert absolute value", variant: "utility", onClick: () => wrapSelection("|", "|") },
    { label: "π", ariaLabel: "insert pi", variant: "utility", onClick: () => handleInsertAction("π") },
    { label: "e", ariaLabel: "insert e", variant: "utility", onClick: () => handleInsertAction("e") },
    { label: "(", ariaLabel: "insert open parenthesis", variant: "utility", onClick: () => handleInsertAction("(") },
    { label: ")", ariaLabel: "insert close parenthesis", variant: "utility", onClick: () => handleInsertAction(")") },
    {
      label: "DEG",
      ariaLabel: "set angle mode to degrees",
      variant: "mode",
      isActive: state.angleMode === "DEG",
      onClick: () => handleAction({ type: "SET_ANGLE_MODE", value: "DEG" })
    },
    {
      label: "RAD",
      ariaLabel: "set angle mode to radians",
      variant: "mode",
      isActive: state.angleMode === "RAD",
      onClick: () => handleAction({ type: "SET_ANGLE_MODE", value: "RAD" })
    },
    { label: "MC", ariaLabel: "clear memory", variant: "mode", onClick: () => handleAction({ type: "MEMORY_CLEAR" }) },
    { label: "MR", ariaLabel: "recall memory", variant: "mode", onClick: () => handleAction({ type: "MEMORY_RECALL" }) },
    { label: "M+", ariaLabel: "add displayed value to memory", variant: "mode", onClick: () => handleAction({ type: "MEMORY_ADD" }) },
    { label: "M-", ariaLabel: "subtract displayed value from memory", variant: "mode", onClick: () => handleAction({ type: "MEMORY_SUBTRACT" }) }
  ];

  const basicButtons: ButtonConfig[] = [
    { label: "AC", ariaLabel: "all clear", variant: "utility", onClick: () => handleAction({ type: "ALL_CLEAR" }) },
    { label: "CE", ariaLabel: "clear expression", variant: "utility", onClick: () => handleAction({ type: "CLEAR" }) },
    { label: "%", ariaLabel: "apply percent", variant: "utility", onClick: () => handleAction({ type: "APPLY_PERCENT" }) },
    { label: "⌫", ariaLabel: "backspace", variant: "utility", onClick: () => handleAction({ type: "DELETE_CHAR", direction: "backward" }) },
    { label: "ANS", ariaLabel: "insert ANS", variant: "utility", onClick: () => handleAction({ type: "INSERT_CHAR", value: "ANS" }) },
    { label: "(", ariaLabel: "insert open parenthesis", variant: "utility", onClick: () => handleAction({ type: "INSERT_CHAR", value: "(" }) },
    { label: ")", ariaLabel: "insert close parenthesis", variant: "utility", onClick: () => handleAction({ type: "INSERT_CHAR", value: ")" }) },
    { label: "÷", ariaLabel: "insert ÷", variant: "operator", onClick: () => handleAction({ type: "INSERT_CHAR", value: "÷" }) },
    { label: "7", ariaLabel: "insert 7", variant: "default", onClick: () => handleAction({ type: "INSERT_CHAR", value: "7" }) },
    { label: "8", ariaLabel: "insert 8", variant: "default", onClick: () => handleAction({ type: "INSERT_CHAR", value: "8" }) },
    { label: "9", ariaLabel: "insert 9", variant: "default", onClick: () => handleAction({ type: "INSERT_CHAR", value: "9" }) },
    { label: "×", ariaLabel: "insert ×", variant: "operator", onClick: () => handleAction({ type: "INSERT_CHAR", value: "×" }) },
    { label: "4", ariaLabel: "insert 4", variant: "default", onClick: () => handleAction({ type: "INSERT_CHAR", value: "4" }) },
    { label: "5", ariaLabel: "insert 5", variant: "default", onClick: () => handleAction({ type: "INSERT_CHAR", value: "5" }) },
    { label: "6", ariaLabel: "insert 6", variant: "default", onClick: () => handleAction({ type: "INSERT_CHAR", value: "6" }) },
    { label: "−", ariaLabel: "insert −", variant: "operator", onClick: () => handleAction({ type: "INSERT_CHAR", value: "−" }) },
    { label: "1", ariaLabel: "insert 1", variant: "default", onClick: () => handleAction({ type: "INSERT_CHAR", value: "1" }) },
    { label: "2", ariaLabel: "insert 2", variant: "default", onClick: () => handleAction({ type: "INSERT_CHAR", value: "2" }) },
    { label: "3", ariaLabel: "insert 3", variant: "default", onClick: () => handleAction({ type: "INSERT_CHAR", value: "3" }) },
    { label: "+", ariaLabel: "insert +", variant: "operator", onClick: () => handleAction({ type: "INSERT_CHAR", value: "+" }) },
    { label: "+/-", ariaLabel: "toggle sign", variant: "utility", onClick: () => handleAction({ type: "TOGGLE_SIGN" }) },
    { label: "0", ariaLabel: "insert 0", variant: "default", onClick: () => handleAction({ type: "INSERT_CHAR", value: "0" }) },
    { label: ".", ariaLabel: "insert decimal point", variant: "default", onClick: () => handleAction({ type: "INSERT_CHAR", value: "." }) },
    { label: "=", ariaLabel: "evaluate expression", variant: "operator", onClick: () => handleAction({ type: "EVALUATE" }) }
  ];

  return (
    <main className={styles.app}>
      <section className={styles.calculator} aria-label="Calculator">
        <header className={styles.header}>
          <div className={styles.headerBar}>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.headerActionButton}
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
                className={styles.headerActionButton}
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

            <button
              type="button"
              className={styles.scienceSwitch}
              role="switch"
              aria-checked={isScientificVisible}
              aria-label={isScientificVisible ? "hide scientific buttons" : "show scientific buttons"}
              onMouseDown={handleMouseDown}
              onClick={() => {
                setIsScientificVisible((currentValue) => !currentValue);
                refocusInput();
              }}
            >
              <span className={styles.scienceSwitchLabel}>Sci</span>
              <span className={styles.scienceSwitchTrack} aria-hidden="true">
                <span className={styles.scienceSwitchThumb} />
              </span>
            </button>
          </div>

          <div className={styles.statusRow} aria-live="polite">
            <span className={styles.statusBadge}>{state.angleMode}</span>
            <span className={styles.statusBadge}>{memoryBadge}</span>
          </div>

          <div className={styles.displayPanel}>
            <input
              ref={inputRef}
              id="calculator-expression"
              className={styles.expressionInput}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
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
                  {state.expression ? renderExpressionMarkup(state.expression) : "0"}
                </span>
                <output
                  className={state.errorMessage ? styles.displayError : styles.displayResult}
                  data-testid="result-value"
                >
                  {displayValue}
                </output>
              </div>
            ) : (
              <div className={styles.editingOverlay} aria-hidden="true">
                <span
                  className={state.expression ? styles.expressionValue : styles.expressionPlaceholder}
                  data-testid="expression-overlay"
                >
                  {state.expression ? renderExpressionMarkup(state.expression) : "0"}
                </span>
              </div>
            )}
          </div>
        </header>

        {isScientificVisible ? (
          <section className={styles.scientificSection} aria-label="Scientific buttons">
            <div className={styles.scientificKeypad}>
              {scientificButtons.map((button) => (
                <button
                  type="button"
                  key={button.ariaLabel}
                  className={getButtonClassName(button.variant, button.isActive).join(" ")}
                  aria-label={button.ariaLabel}
                  aria-pressed={button.isActive}
                  onMouseDown={handleMouseDown}
                  onClick={button.onClick}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <div className={styles.keypad}>
          {basicButtons.map((button) => (
            <button
              type="button"
              key={button.ariaLabel}
              className={getButtonClassName(button.variant).join(" ")}
              aria-label={button.ariaLabel}
              onMouseDown={handleMouseDown}
              onClick={button.onClick}
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
                    <span className={styles.historyExpression}>{renderExpressionMarkup(entry.expression)}</span>
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
