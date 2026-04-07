export type HistoryEntry = {
  expression: string;
  result: number;
  timestamp: number;
};

export type CalculatorState = {
  expression: string;
  cursorIndex: number;
  selectionStart: number;
  selectionEnd: number;
  result: number | null;
  lastResult: number | null;
  history: HistoryEntry[];
  errorMessage: string | null;
};

export type EvaluatorSuccess = {
  ok: true;
  value: number;
  resolvedExpression: string;
};

export type EvaluatorFailure = {
  ok: false;
  error: string;
};

export type EvaluatorResult = EvaluatorSuccess | EvaluatorFailure;
