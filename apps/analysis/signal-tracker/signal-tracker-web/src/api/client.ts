import { apiErrorSchema } from "@repo/api-contracts";
import {
  signalTrackerRouteContracts,
  type SignalTrackerRouteName,
  type SignalTrackerRouteRequest,
  type SignalTrackerRouteResponse
} from "@repo/signal-tracker-shared";

import { loadRuntimeConfig } from "../config";

export type SignalTrackerApiPostOptions<TName extends SignalTrackerRouteName> =
  {
    routeName: TName;
    body: SignalTrackerRouteRequest<TName>;
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

export async function postSignalTrackerApi<
  TName extends SignalTrackerRouteName
>(
  options: SignalTrackerApiPostOptions<TName>
): Promise<SignalTrackerRouteResponse<TName>> {
  const config = await loadRuntimeConfig();
  const contract = signalTrackerRouteContracts[options.routeName];
  const response = await fetch(`${config.apiBaseUrl}${contract.route.path}`, {
    method: contract.route.method,
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(options.body),
    signal: options.signal
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return contract.responseSchema.parse(
    await response.json()
  ) as SignalTrackerRouteResponse<TName>;
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
