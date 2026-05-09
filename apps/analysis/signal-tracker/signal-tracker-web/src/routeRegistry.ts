type AppRouteDefinition = {
  path: `/${string}`;
};

function defineAppRoutes<
  const TRoutes extends Record<string, AppRouteDefinition>
>(routes: TRoutes) {
  return routes;
}

export const appRoutes = defineAppRoutes({
  home: {
    path: "/"
  },
  listTopics: {
    path: "/topics"
  },
  topicDetails: {
    path: "/topics/$topicId/$topicTitle"
  }
});

export type AppRouteKey = keyof typeof appRoutes;
export type AppRoutePath = (typeof appRoutes)[AppRouteKey]["path"];
export type StaticAppRoutePath = {
  [TKey in AppRouteKey]: (typeof appRoutes)[TKey]["path"] extends `${string}$${string}`
    ? never
    : (typeof appRoutes)[TKey]["path"];
}[AppRouteKey];
