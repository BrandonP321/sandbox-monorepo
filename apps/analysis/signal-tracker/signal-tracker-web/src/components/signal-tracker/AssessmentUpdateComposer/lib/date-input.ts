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

export { toDateStart, toOptionalDateStart };
