import type { z } from "zod";

type RouteContractSpec = {
  method: string;
  path: `/${string}`;
};

type RouteContract = {
  requestSchema: z.ZodType;
  responseSchema: z.ZodType;
  route: RouteContractSpec;
};

type RouteContractRegistry = Record<string, RouteContract>;

type RouteContractName<TContracts extends RouteContractRegistry> =
  keyof TContracts & string;

type RouteContractRequest<
  TContracts extends RouteContractRegistry,
  TName extends RouteContractName<TContracts>
> = z.infer<TContracts[TName]["requestSchema"]>;

type RouteContractResponse<
  TContracts extends RouteContractRegistry,
  TName extends RouteContractName<TContracts>
> = z.infer<TContracts[TName]["responseSchema"]>;

type RouteContractTransportRequest<
  TContracts extends RouteContractRegistry,
  TName extends RouteContractName<TContracts>
> = {
  body: RouteContractRequest<TContracts, TName>;
  method: TContracts[TName]["route"]["method"];
  url: TContracts[TName]["route"]["path"];
};

function buildRouteContractRequest<
  TContracts extends RouteContractRegistry,
  TName extends RouteContractName<TContracts>
>(
  contracts: TContracts,
  routeName: TName,
  request: RouteContractRequest<TContracts, TName>
): RouteContractTransportRequest<TContracts, TName> {
  const contract = contracts[routeName];

  return {
    body: contract.requestSchema.parse(request) as RouteContractRequest<
      TContracts,
      TName
    >,
    method: contract.route.method,
    url: contract.route.path
  } as RouteContractTransportRequest<TContracts, TName>;
}

function parseRouteContractResponse<
  TContracts extends RouteContractRegistry,
  TName extends RouteContractName<TContracts>
>(
  contracts: TContracts,
  routeName: TName,
  response: unknown
): RouteContractResponse<TContracts, TName> {
  return contracts[routeName].responseSchema.parse(
    response
  ) as RouteContractResponse<TContracts, TName>;
}

export { buildRouteContractRequest, parseRouteContractResponse };
export type {
  RouteContract,
  RouteContractName,
  RouteContractRegistry,
  RouteContractRequest,
  RouteContractResponse,
  RouteContractSpec,
  RouteContractTransportRequest
};
