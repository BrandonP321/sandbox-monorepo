const MAX_FRACTION_DIGITS = 12;

function trimTrailingZeros(value: string): string {
  if (!value.includes(".")) {
    return value;
  }

  return value.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

export function formatNumber(raw: number): string {
  if (!Number.isFinite(raw)) {
    return "Error";
  }

  if (Object.is(raw, -0)) {
    return "0";
  }

  const normalized = Number(raw.toPrecision(MAX_FRACTION_DIGITS));

  if (!Number.isFinite(normalized)) {
    return "Error";
  }

  const asString = normalized.toString();

  if (asString.includes("e") || asString.includes("E")) {
    return asString;
  }

  return trimTrailingZeros(asString);
}
