import type { HistoryEntry } from "./types";
import type { AngleMode } from "./types";

export type DeleteDirection = "backward" | "forward";

export type CalculatorAction =
  | { type: "INSERT_CHAR"; value: string }
  | { type: "DELETE_CHAR"; direction: DeleteDirection }
  | { type: "MOVE_CURSOR"; selectionStart: number; selectionEnd: number }
  | {
      type: "SET_EXPRESSION";
      expression: string;
      selectionStart: number;
      selectionEnd: number;
    }
  | { type: "EVALUATE" }
  | { type: "CLEAR" }
  | { type: "CLEAR_HISTORY" }
  | { type: "SET_FROM_HISTORY"; entry: HistoryEntry }
  | { type: "PASTE_INPUT"; value: string }
  | { type: "TOGGLE_SIGN" }
  | { type: "APPLY_PERCENT" }
  | { type: "ALL_CLEAR" }
  | { type: "SET_ANGLE_MODE"; value: AngleMode }
  | { type: "MEMORY_CLEAR" }
  | { type: "MEMORY_RECALL" }
  | { type: "MEMORY_ADD" }
  | { type: "MEMORY_SUBTRACT" };
