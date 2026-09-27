import type { Entry, HistoricalDate, Viewport } from "./model";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
const daysInMonth = (year: number) => [
  31,
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
  31,
  30,
  31,
  30,
  31,
  31,
  30,
  31,
  30,
  31
];
const astronomicalYear = (date: HistoricalDate) =>
  date.era === "BCE" ? 1 - date.year : date.year;

export function validDate(date: HistoricalDate) {
  if (!Number.isInteger(date.year) || date.year < 1 || date.year > 9999)
    return false;
  if (
    date.month !== undefined &&
    (!Number.isInteger(date.month) || date.month < 1 || date.month > 12)
  )
    return false;
  if (
    date.day !== undefined &&
    (date.month === undefined ||
      !Number.isInteger(date.day) ||
      date.day < 1 ||
      date.day > daysInMonth(astronomicalYear(date))[date.month - 1])
  )
    return false;
  return true;
}

// No Date/UTC conversion: an ordinal fraction is only a drawing coordinate.
export function datePosition(date: HistoricalDate, upper = false): number {
  const year = astronomicalYear(date);
  const lengths = daysInMonth(year);
  const total = lengths.reduce((sum, days) => sum + days, 0);
  if (date.month === undefined) return year + (upper ? 1 : 0);
  const preceding = lengths
    .slice(0, date.month - 1)
    .reduce((sum, days) => sum + days, 0);
  return (
    year +
    (preceding +
      (date.day === undefined
        ? upper
          ? lengths[date.month - 1]
          : 0
        : date.day - 1 + (upper ? 1 : 0))) /
      total
  );
}

export function formatDate(date: HistoricalDate): string {
  return [
    date.day,
    date.month === undefined ? undefined : months[date.month - 1],
    date.year,
    date.era === "BCE" ? "BCE" : undefined
  ]
    .filter((part) => part !== undefined)
    .join(" ");
}

export function axisLabel(position: number) {
  const year = Math.floor(position);
  return year <= 0 ? `${1 - year} BCE` : `${year}`;
}

export function viewportLabel(position: number, span: number) {
  if (span >= 8) return axisLabel(position);
  const year = Math.floor(position);
  const lengths = daysInMonth(year);
  let day = Math.floor(
    (position - year) * lengths.reduce((sum, days) => sum + days, 0)
  );
  let month = 0;
  while (month < 11 && day >= lengths[month]) {
    day -= lengths[month];
    month++;
  }
  return formatDate({
    year: year <= 0 ? 1 - year : year,
    era: year <= 0 ? "BCE" : "CE",
    month: month + 1,
    day: span < 0.4 ? day + 1 : undefined
  });
}

export function entryDate(entry: Entry) {
  const prefix = {
    exact: "",
    approximate: "c. ",
    before: "Before ",
    after: "After "
  }[entry.qualifier];
  const end = entry.end ? ` – ${formatDate(entry.end)}` : "";
  return `${prefix}${formatDate(entry.start)}${end}${entry.shape === "range" ? " (uncertain occurrence)" : entry.shape === "period" ? " (period)" : ""}`;
}

export function entryBounds(entry: Entry): [number, number] {
  return [
    entry.qualifier === "before" ? -Infinity : datePosition(entry.start),
    entry.qualifier === "after"
      ? Infinity
      : datePosition(entry.end ?? entry.start, true)
  ];
}

export function overlaps(entry: Entry, viewport: Viewport) {
  const [start, end] = entryBounds(entry);
  return start <= viewport.end && end >= viewport.start;
}

export function fitEntries(entries: Entry[]): Viewport {
  if (!entries.length) return { start: 1750, end: 1900 };
  const start = Math.min(...entries.map((entry) => datePosition(entry.start)));
  const end = Math.max(
    ...entries.map((entry) => datePosition(entry.end ?? entry.start, true))
  );
  const padding = Math.max((end - start) * 0.06, 1);
  return { start: start - padding, end: end + padding };
}

export function zoomViewport(viewport: Viewport, factor: number): Viewport {
  const center = (viewport.start + viewport.end) / 2;
  const span = Math.max(
    1 / 12,
    Math.min(24000, (viewport.end - viewport.start) * factor)
  );
  return { start: center - span / 2, end: center + span / 2 };
}

export function validateEntry(entry: Entry): string | undefined {
  if (!entry.title.trim()) return "Give this entry a title.";
  if (!validDate(entry.start) || (entry.end && !validDate(entry.end)))
    return "Use a valid date, with years 1–9999 and no year zero. A day needs a month.";
  if (entry.shape !== "point" && !entry.end)
    return "Periods and uncertain ranges need an end date.";
  if (entry.end && datePosition(entry.end, true) <= datePosition(entry.start))
    return "The end date must be on or after the start date.";
  if (entry.imageUrl && !/^https?:\/\//i.test(entry.imageUrl))
    return "Image URLs must start with https:// or http://.";
  return undefined;
}
