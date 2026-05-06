function toDateInputValue(value: string): string {
  return value.slice(0, 10);
}

function toDateStart(value: string): string {
  return `${value.trim()}T00:00:00.000Z`;
}

export { toDateInputValue, toDateStart };
