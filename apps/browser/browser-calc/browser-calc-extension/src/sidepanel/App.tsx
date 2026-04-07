import { useEffect, useReducer } from "react";
import {
  getInitialCalculatorState,
  reduceCalculator,
  type CalculatorAction,
  type CalculatorOperator
} from "../calculator/calculator";
import { keyToCalculatorAction } from "../calculator/keymap";
import styles from "./App.module.scss";

type ButtonConfig = {
  label: string;
  action: CalculatorAction;
  style: "default" | "operator" | "utility";
  extraClassName?: string;
};

const BUTTONS: ButtonConfig[] = [
  { label: "C", action: { type: "clear" }, style: "utility" },
  { label: "±", action: { type: "toggleSign" }, style: "utility" },
  { label: "%", action: { type: "percent" }, style: "utility" },
  { label: "÷", action: { type: "operator", operator: "/" }, style: "operator" },
  { label: "7", action: { type: "digit", digit: "7" }, style: "default" },
  { label: "8", action: { type: "digit", digit: "8" }, style: "default" },
  { label: "9", action: { type: "digit", digit: "9" }, style: "default" },
  { label: "×", action: { type: "operator", operator: "*" }, style: "operator" },
  { label: "4", action: { type: "digit", digit: "4" }, style: "default" },
  { label: "5", action: { type: "digit", digit: "5" }, style: "default" },
  { label: "6", action: { type: "digit", digit: "6" }, style: "default" },
  { label: "−", action: { type: "operator", operator: "-" }, style: "operator" },
  { label: "1", action: { type: "digit", digit: "1" }, style: "default" },
  { label: "2", action: { type: "digit", digit: "2" }, style: "default" },
  { label: "3", action: { type: "digit", digit: "3" }, style: "default" },
  { label: "+", action: { type: "operator", operator: "+" }, style: "operator" },
  { label: "0", action: { type: "digit", digit: "0" }, style: "default", extraClassName: styles.zero },
  { label: ".", action: { type: "decimal" }, style: "default" },
  { label: "⌫", action: { type: "backspace" }, style: "utility" },
  { label: "=", action: { type: "equals" }, style: "operator" }
];

function getOperatorClass(styleType: ButtonConfig["style"]): string | undefined {
  if (styleType === "operator") {
    return styles.operator;
  }

  if (styleType === "utility") {
    return styles.utility;
  }

  return undefined;
}

function normalizeOperatorForAria(operator: CalculatorOperator): string {
  switch (operator) {
    case "/":
      return "divide";
    case "*":
      return "multiply";
    case "-":
      return "subtract";
    case "+":
      return "add";
  }
}

function describeAction(action: CalculatorAction): string {
  if (action.type === "digit") {
    return `digit ${action.digit}`;
  }

  if (action.type === "operator") {
    return `${normalizeOperatorForAria(action.operator)} operator`;
  }

  if (action.type === "toggleSign") {
    return "toggle sign";
  }

  return action.type;
}

export default function App() {
  const [state, dispatch] = useReducer(reduceCalculator, undefined, getInitialCalculatorState);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const action = keyToCalculatorAction(event.key, {
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey
      });

      if (!action) {
        return;
      }

      event.preventDefault();
      dispatch(action);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main className={styles.app}>
      <section className={styles.calculator} aria-label="Calculator">
        <output className={styles.display} aria-live="polite" data-testid="display">
          {state.display}
        </output>

        <div className={styles.keypad}>
          {BUTTONS.map((button) => (
            <button
              type="button"
              key={button.label}
              className={[styles.key, getOperatorClass(button.style), button.extraClassName].filter(Boolean).join(" ")}
              aria-label={describeAction(button.action)}
              onClick={() => dispatch(button.action)}
            >
              {button.label}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
