export function toIsoTimestamp(value: Date | string): string {
  return toDate(value).toISOString();
}

export function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function nullableDateToIso(
  value: Date | string | null | undefined
): string | undefined {
  return value ? toIsoTimestamp(value) : undefined;
}

export function nullableTimestampToDate(
  value: Date | string | null | undefined
): Date | null {
  return value ? toDate(value) : null;
}
