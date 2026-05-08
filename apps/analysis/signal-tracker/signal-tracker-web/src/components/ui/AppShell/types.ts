import type * as React from "react";
import type { ResolveParams } from "@tanstack/react-router";

type AppShellRouteParams<TPath extends string = string> = string extends TPath
  ? Record<string, string | undefined>
  : ResolveParams<TPath>;

type AppShellRouteContext<TPath extends string = string> = {
  activePath: string | undefined;
  params: AppShellRouteParams<TPath>;
};

type AppShellRouteVisibility = "always" | "activeBranch";

type AnyAppShellRouteValue<TValue> =
  | TValue
  | {
      bivarianceHack(context: AppShellRouteContext): TValue;
    }["bivarianceHack"];

type AppShellRouteValue<TValue, TPath extends string = string> =
  | TValue
  | ((context: AppShellRouteContext<TPath>) => TValue);

type AppShellRoute<TPath extends string = string> = {
  children?: readonly AnyAppShellRoute[];
  icon?: React.ReactNode;
  id?: string;
  params?: AppShellRouteValue<AppShellRouteParams<TPath>, TPath>;
  path: TPath;
  title: AppShellRouteValue<string, TPath>;
  to?: AppShellRouteValue<string, TPath>;
  visibleWhen?: AppShellRouteVisibility;
};

type AnyAppShellRoute = {
  children?: readonly AnyAppShellRoute[];
  icon?: React.ReactNode;
  id?: string;
  params?: AnyAppShellRouteValue<AppShellRouteParams>;
  path: string;
  title: AnyAppShellRouteValue<string>;
  to?: AnyAppShellRouteValue<string>;
  visibleWhen?: AppShellRouteVisibility;
};

type AppShellResolvedRoute = {
  children?: readonly AppShellResolvedRoute[];
  icon?: React.ReactNode;
  id: string;
  params?: AppShellRouteParams;
  path: string;
  title: string;
  to: string;
};

export {
  type AnyAppShellRoute,
  type AppShellResolvedRoute,
  type AppShellRoute,
  type AppShellRouteContext,
  type AppShellRouteParams
};
