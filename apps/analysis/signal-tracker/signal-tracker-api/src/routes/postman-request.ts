import {
  definePostmanRequest,
  type PostmanRequestConfig
} from "@repo/postman-sync";
import {
  signalTrackerRouteContracts,
  type SignalTrackerRouteName
} from "@repo/signal-tracker-shared";

type SignalTrackerPostmanRequestOptions<TName extends SignalTrackerRouteName> =
  Omit<
    PostmanRequestConfig<
      (typeof signalTrackerRouteContracts)[TName]["requestSchema"]
    >,
    "routeName" | "route" | "requestSchema"
  >;

export function defineSignalTrackerPostmanRequest<
  TName extends SignalTrackerRouteName
>(routeName: TName, options: SignalTrackerPostmanRequestOptions<TName>) {
  const contract = signalTrackerRouteContracts[routeName];

  return definePostmanRequest({
    routeName,
    route: contract.route,
    requestSchema: contract.requestSchema,
    ...options
  });
}
