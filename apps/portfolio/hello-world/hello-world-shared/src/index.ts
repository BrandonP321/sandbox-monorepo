import { z } from "zod";

type HelloWorldRouteSpec = {
  method: "POST";
  path: `/${string}`;
};

export const helloWorldRoutes = {
  getHello: {
    method: "POST",
    path: "/get-hello"
  },
  getHealth: {
    method: "POST",
    path: "/get-health"
  }
} as const satisfies Record<string, HelloWorldRouteSpec>;

export type HelloWorldRouteName = keyof typeof helloWorldRoutes;
export type HelloWorldRoute = (typeof helloWorldRoutes)[HelloWorldRouteName];

export const helloWorldRouteEntries = Object.entries(helloWorldRoutes) as Array<
  [HelloWorldRouteName, HelloWorldRoute]
>;

export const helloWorldRouteList = helloWorldRouteEntries.map(([, route]) => route);

export const helloWorldGetHelloResponseSchema = z.object({
  message: z.string().min(1)
});

export type HelloWorldGetHelloResponse = z.infer<
  typeof helloWorldGetHelloResponseSchema
>;
