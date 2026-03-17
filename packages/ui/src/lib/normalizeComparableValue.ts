export function normalizeComparableValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value !== "object") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value.map((item) => normalizeComparableValue(item)));
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, entryValue]) => [key, normalizeComparableValue(entryValue)]);

  return JSON.stringify(entries);
}
