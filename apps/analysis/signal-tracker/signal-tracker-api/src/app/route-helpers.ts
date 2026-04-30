import { AppError, responses, type ApiResponse } from "@repo/api-core";

import { createPersistenceUnavailableError } from "./errors";

type SafeParseResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
    };

type RequestSchema<T> = {
  safeParse: (payload: unknown) => SafeParseResult<T>;
};

type ResponseSchema<T> = {
  parse: (payload: unknown) => T;
};

type ParseRequestBodyOptions = {
  invalidMessage: string;
};

type PersistenceErrorMappingOptions = {
  mapDomainError?: (error: unknown) => AppError | undefined;
};

export function parseJsonBody(body: string | null | undefined): unknown {
  if (!body) {
    return {};
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new AppError(
      "VALIDATION_ERROR",
      "Request body must be valid JSON",
      400
    );
  }
}

export function parseRequestBody<T>(
  schema: RequestSchema<T>,
  body: string | null | undefined,
  options: ParseRequestBodyOptions
): T {
  const parsedRequest = schema.safeParse(parseJsonBody(body));

  if (!parsedRequest.success) {
    throw new AppError("VALIDATION_ERROR", options.invalidMessage, 400);
  }

  return parsedRequest.data;
}

export function okResponse<T>(
  schema: ResponseSchema<T>,
  payload: unknown
): ApiResponse {
  return responses.ok(schema.parse(payload));
}

export async function withPersistenceErrorMapping<T>(
  operation: () => Promise<T> | T,
  options: PersistenceErrorMappingOptions = {}
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const mappedError = options.mapDomainError?.(error);

    if (mappedError) {
      throw mappedError;
    }

    throw createPersistenceUnavailableError();
  }
}
