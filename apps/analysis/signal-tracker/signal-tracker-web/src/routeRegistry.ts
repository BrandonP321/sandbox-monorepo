import {
  defineAppRoutes,
  type AppRouteKey as SharedAppRouteKey,
  type AppRoutePath as SharedAppRoutePath,
  type StaticAppRoutePath as SharedStaticAppRoutePath
} from "@repo/ui-base/routing";

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

export type AppRouteKey = SharedAppRouteKey<typeof appRoutes>;
export type AppRoutePath = SharedAppRoutePath<typeof appRoutes>;
export type StaticAppRoutePath = SharedStaticAppRoutePath<typeof appRoutes>;
