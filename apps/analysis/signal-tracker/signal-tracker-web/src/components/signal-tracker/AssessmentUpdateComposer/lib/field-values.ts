function splitTextareaLines(value: string): string[] {
  return value
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function isOptionalProbability(value: string): boolean {
  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return true;
  }

  if (!/^\d+$/u.test(trimmedValue)) {
    return false;
  }

  const probability = Number(trimmedValue);

  return (
    Number.isInteger(probability) && probability >= 0 && probability <= 100
  );
}

function parseOptionalProbability(value: string): number | undefined {
  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return undefined;
  }

  return Number(trimmedValue);
}

export { isOptionalProbability, parseOptionalProbability, splitTextareaLines };
