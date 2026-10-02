const weddingDate = Date.UTC(2027, 7, 21);
const calendarDate = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "numeric",
  day: "numeric"
});

function getWeddingDaysRemaining(now: Date): number {
  const parts = calendarDate.formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  // UTC encodes calendar dates here, not elapsed time between LA midnights.
  const today = Date.UTC(value("year"), value("month") - 1, value("day"));
  return (weddingDate - today) / 86_400_000;
}

export { getWeddingDaysRemaining };
