import { z } from "zod";

export const defaultRequiredStringMessage = "Enter a value.";
export const defaultHttpUrlMessage = "URL must use http or https";

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

export function createOptionalTrimmedNonEmptyString() {
  return z.string().trim().min(1).optional();
}

export function createOptionalClearableTrimmedString() {
  return z
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
}

export function createOptionalTrimmedUrlString() {
  return z.string().trim().url().optional();
}

export function createTrimmedHttpUrlString(message = defaultHttpUrlMessage) {
  return z.string().trim().url().refine(isHttpUrl, { message });
}

export function isHttpUrl(value: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export const trimmedRequiredString = createTrimmedRequiredString();

export const optionalTrimmedString = createOptionalTrimmedString();

export const optionalTrimmedNonEmptyString =
  createOptionalTrimmedNonEmptyString();

export const optionalClearableTrimmedString =
  createOptionalClearableTrimmedString();

export const optionalTrimmedUrlString = createOptionalTrimmedUrlString();

export const trimmedHttpUrlString = createTrimmedHttpUrlString();

export const trimmedRequiredStringArray = z
  .array(trimmedRequiredString)
  .min(1)
  .transform((values) => values.map((value) => value.trim()));
