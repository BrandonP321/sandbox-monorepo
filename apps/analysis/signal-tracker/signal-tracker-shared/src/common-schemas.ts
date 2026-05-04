import { z } from "zod";

export const defaultRequiredStringMessage = "Enter a value.";

export function createTrimmedRequiredString(
  message = defaultRequiredStringMessage
) {
  return z.string().trim().min(1, message);
}

export function createOptionalTrimmedString() {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value));
}

export const trimmedRequiredString = createTrimmedRequiredString();

export const optionalTrimmedString = createOptionalTrimmedString();

export const optionalClearableTrimmedString = z
  .union([z.string().trim(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === "") {
      return null;
    }

    return value;
  });

export const trimmedRequiredStringArray = z
  .array(trimmedRequiredString)
  .min(1)
  .transform((values) => values.map((value) => value.trim()));
