import {
  buildRouteContractRequest,
  parseRouteContractResponse
} from "@repo/api-contracts";

import {
  signalTrackerRouteContracts,
  type SignalTrackerRouteName,
  type SignalTrackerRouteRequest,
  type SignalTrackerRouteResponse
} from "@repo/signal-tracker-shared";

function buildSignalTrackerRouteRequest<TName extends SignalTrackerRouteName>(
  routeName: TName,
  request: SignalTrackerRouteRequest<TName>
) {
  return buildRouteContractRequest(
    signalTrackerRouteContracts,
    routeName,
    request
  );
}

function parseSignalTrackerRouteResponse<TName extends SignalTrackerRouteName>(
  routeName: TName,
  response: unknown
): SignalTrackerRouteResponse<TName> {
  return parseRouteContractResponse(
    signalTrackerRouteContracts,
    routeName,
    response
  ) as SignalTrackerRouteResponse<TName>;
}

export { buildSignalTrackerRouteRequest, parseSignalTrackerRouteResponse };
