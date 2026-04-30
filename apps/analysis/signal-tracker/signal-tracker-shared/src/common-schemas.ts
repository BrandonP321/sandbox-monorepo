import { z } from "zod";

export const trimmedRequiredString = z.string().trim().min(1);

export const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

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
