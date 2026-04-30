import { apiErrorSchema } from "@repo/api-contracts";
import type { SignalTrackerRoute } from "@repo/signal-tracker-shared";

import { loadRuntimeConfig } from "../config";

type ResponseSchema<TResponse> = {
  parse(value: unknown): TResponse;
};

export type SignalTrackerApiPostOptions<TResponse> = {
  route: SignalTrackerRoute;
  body: unknown;
  responseSchema: ResponseSchema<TResponse>;
  signal?: AbortSignal;
};

export class SignalTrackerApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "SignalTrackerApiError";
  }
}

export async function postSignalTrackerApi<TResponse>(
  options: SignalTrackerApiPostOptions<TResponse>
): Promise<TResponse> {
  const config = await loadRuntimeConfig();
  const response = await fetch(`${config.apiBaseUrl}${options.route.path}`, {
    method: options.route.method,
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(options.body),
    signal: options.signal
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return options.responseSchema.parse(await response.json());
}

async function createApiError(
  response: Response
): Promise<SignalTrackerApiError> {
  try {
    const parsedError = apiErrorSchema.safeParse(await response.json());

    if (parsedError.success) {
      return new SignalTrackerApiError(
        response.status,
        parsedError.data.error.code,
        parsedError.data.error.message
      );
    }
  } catch {
    // Fall through to the generic HTTP error below.
  }

  return new SignalTrackerApiError(
    response.status,
    "HTTP_ERROR",
    "The Signal Tracker API request failed."
  );
}
