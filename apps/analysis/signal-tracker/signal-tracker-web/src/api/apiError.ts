import { apiErrorSchema } from "@repo/api-contracts";
import type { SignalTrackerApiErrorCode } from "@repo/signal-tracker-shared";

const fallbackApiErrorMessage =
  "An unexpected error occurred. Please try again.";

function getApiErrorMessage(
  error: unknown,
  fallbackMessage = fallbackApiErrorMessage
) {
  const directMessage = parseStringMessage(error);

  if (directMessage) {
    return directMessage;
  }

  const apiErrorMessage = parseApiErrorPayloadMessage(error);

  if (apiErrorMessage) {
    return apiErrorMessage;
  }

  if (!isRecord(error)) {
    return fallbackMessage;
  }

  if ("data" in error) {
    const dataMessage = parseApiErrorPayloadMessage(error.data);

    if (dataMessage) {
      return dataMessage;
    }

    const dataFallbackMessage = parseStringMessage(error.data);

    if (dataFallbackMessage) {
      return dataFallbackMessage;
    }
  }

  const errorMessage = parseStringMessage(error.error);

  if (errorMessage) {
    return errorMessage;
  }

  const message = parseStringMessage(error.message);

  if (message) {
    return message;
  }

  return fallbackMessage;
}

function isApiErrorCode(
  error: unknown,
  code: SignalTrackerApiErrorCode
): boolean {
  const directCode = parseApiErrorPayloadCode(error);

  if (directCode === code) {
    return true;
  }

  if (!isRecord(error) || !("data" in error)) {
    return false;
  }

  return parseApiErrorPayloadCode(error.data) === code;
}

function parseApiErrorPayloadCode(error: unknown) {
  const parsedError = apiErrorSchema.safeParse(error);

  if (!parsedError.success) {
    return undefined;
  }

  return parsedError.data.error.code;
}

function parseApiErrorPayloadMessage(error: unknown) {
  const parsedError = apiErrorSchema.safeParse(error);

  if (!parsedError.success) {
    return undefined;
  }

  return parseStringMessage(parsedError.data.error.message);
}

function parseStringMessage(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const message = value.trim();

  return message.length > 0 ? message : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export { fallbackApiErrorMessage, getApiErrorMessage, isApiErrorCode };
