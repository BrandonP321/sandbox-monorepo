function getTodayDateInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isDateInputValue(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value.trim());

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function toDateStart(value: string): string {
  return `${value.trim()}T00:00:00.000Z`;
}

function toOptionalDateStart(value: string): string | undefined {
  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return undefined;
  }

  return toDateStart(trimmedValue);
}

export {
  getTodayDateInputValue,
  isDateInputValue,
  toDateStart,
  toOptionalDateStart
};
