const ERROR_DISPLAY = "Error";
const MAX_FRACTION_DIGITS = 12;

function trimTrailingZeros(value: string): string {
  if (!value.includes(".")) {
    return value;
  }

  return value.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

export function normalizeDisplay(raw: number): string {
  if (!Number.isFinite(raw)) {
    return ERROR_DISPLAY;
  }

  if (Object.is(raw, -0)) {
    return "0";
  }

  const normalized = Number(raw.toPrecision(MAX_FRACTION_DIGITS));

  if (!Number.isFinite(normalized)) {
    return ERROR_DISPLAY;
  }

  const asString = normalized.toString();

  if (asString.includes("e") || asString.includes("E")) {
    return asString;
  }

  return trimTrailingZeros(asString);
}

export function parseDisplayValue(display: string): number {
  const parsed = Number.parseFloat(display);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export { ERROR_DISPLAY };
