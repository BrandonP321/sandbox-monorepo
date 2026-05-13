import { describe, expect, expectTypeOf, it } from "vitest";

import {
  defineAppRoutes,
  type AppRouteKey,
  type AppRoutePath,
  type RoutePathParams,
  type StaticAppRoutePath
} from "./index";

const routes = defineAppRoutes({
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

describe("routing helpers", () => {
  it("preserves literal route paths", () => {
    expect(routes.topicDetails.path).toBe("/topics/$topicId/$topicTitle");
  });

  it("types route keys and route paths from the route registry", () => {
    expectTypeOf<AppRouteKey<typeof routes>>().toEqualTypeOf<
      "home" | "listTopics" | "topicDetails"
    >();
    expectTypeOf<AppRoutePath<typeof routes>>().toEqualTypeOf<
      "/" | "/topics" | "/topics/$topicId/$topicTitle"
    >();
  });

  it("narrows static route paths to paths without params", () => {
    expectTypeOf<StaticAppRoutePath<typeof routes>>().toEqualTypeOf<
      "/" | "/topics"
    >();
  });

  it("extracts route params from dollar-prefixed path segments", () => {
    expectTypeOf<
      RoutePathParams<"/topics/$topicId/$topicTitle">
    >().toEqualTypeOf<{
      topicId: string;
      topicTitle: string;
    }>();
    expectTypeOf<RoutePathParams<"/topics">>().toEqualTypeOf<
      Record<never, never>
    >();
  });
});
