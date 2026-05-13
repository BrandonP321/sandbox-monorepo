type AppRouteDefinition = {
  path: `/${string}`;
};

type AppRouteKey<TRoutes extends Record<string, AppRouteDefinition>> =
  keyof TRoutes;

type AppRoutePath<TRoutes extends Record<string, AppRouteDefinition>> =
  TRoutes[AppRouteKey<TRoutes>]["path"];

type StaticAppRoutePath<TRoutes extends Record<string, AppRouteDefinition>> = {
  [TKey in AppRouteKey<TRoutes>]: TRoutes[TKey]["path"] extends `${string}$${string}`
    ? never
    : TRoutes[TKey]["path"];
}[AppRouteKey<TRoutes>];

type RoutePathParamNames<TPath extends string> =
  TPath extends `${string}$${infer TParam}/${infer TRest}`
    ? CleanRoutePathParam<TParam> | RoutePathParamNames<`/${TRest}`>
    : TPath extends `${string}$${infer TParam}`
      ? CleanRoutePathParam<TParam>
      : never;

type CleanRoutePathParam<TParam extends string> =
  TParam extends `${infer TCleanParam}?` ? TCleanParam : TParam;

type RoutePathParams<TPath extends string = string> = string extends TPath
  ? Record<string, string | undefined>
  : [RoutePathParamNames<TPath>] extends [never]
    ? Record<never, never>
    : {
        [TParam in RoutePathParamNames<TPath>]: string;
      };

function defineAppRoutes<
  const TRoutes extends Record<string, AppRouteDefinition>
>(routes: TRoutes) {
  return routes;
}

export {
  defineAppRoutes,
  type AppRouteDefinition,
  type AppRouteKey,
  type AppRoutePath,
  type RoutePathParams,
  type StaticAppRoutePath
};
