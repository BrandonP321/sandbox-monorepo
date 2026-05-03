import type { FetchArgs } from "@reduxjs/toolkit/query";

import {
  signalTrackerRouteContracts,
  type SignalTrackerRouteName,
  type SignalTrackerRouteRequest,
  type SignalTrackerRouteResponse
} from "@repo/signal-tracker-shared";

export function buildSignalTrackerRouteRequest<
  TName extends SignalTrackerRouteName
>(routeName: TName, request: SignalTrackerRouteRequest<TName>): FetchArgs {
  const contract = signalTrackerRouteContracts[routeName];

  return {
    url: contract.route.path,
    method: contract.route.method,
    body: contract.requestSchema.parse(request)
  };
}

export function parseSignalTrackerRouteResponse<
  TName extends SignalTrackerRouteName
>(routeName: TName, response: unknown): SignalTrackerRouteResponse<TName> {
  return signalTrackerRouteContracts[routeName].responseSchema.parse(
    response
  ) as SignalTrackerRouteResponse<TName>;
}
