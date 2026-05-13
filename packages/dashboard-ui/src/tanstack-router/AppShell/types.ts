import type * as React from "react";
import type { RoutePathParams } from "@repo/ui-base/routing";

type AppShellRouteParams<TPath extends string = string> = string extends TPath
  ? Record<string, string | undefined>
  : RoutePathParams<TPath>;

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
  description?: AppShellRouteValue<string | undefined, TPath>;
  icon?: React.ReactNode;
  id?: string;
  params?: AppShellRouteValue<AppShellRouteParams<TPath>, TPath>;
  path: TPath;
  /* SEO page title */
  title: AppShellRouteValue<string, TPath>;
  /* Breadcrumb title */
  breadcrumbTitle?: AppShellRouteValue<string, TPath>;
  /* Sidebar navigation link title */
  navLinkTitle?: AppShellRouteValue<string, TPath>;
  to?: AppShellRouteValue<string, TPath>;
  visibleWhen?: AppShellRouteVisibility;
};

type AnyAppShellRoute = {
  children?: readonly AnyAppShellRoute[];
  description?: AnyAppShellRouteValue<string | undefined>;
  icon?: React.ReactNode;
  id?: string;
  params?: AnyAppShellRouteValue<AppShellRouteParams>;
  path: string;
  title: AnyAppShellRouteValue<string>;
  breadcrumbTitle?: AnyAppShellRouteValue<string>;
  navLinkTitle?: AnyAppShellRouteValue<string>;
  to?: AnyAppShellRouteValue<string>;
  visibleWhen?: AppShellRouteVisibility;
};

type AppShellResolvedRoute = {
  children?: readonly AppShellResolvedRoute[];
  description?: string | undefined;
  icon?: React.ReactNode;
  id: string;
  params?: AppShellRouteParams;
  path: string;
  title: string;
  breadcrumbTitle: string;
  navLinkTitle: string;
  to: string;
};

export {
  type AnyAppShellRoute,
  type AppShellResolvedRoute,
  type AppShellRoute,
  type AppShellRouteContext,
  type AppShellRouteParams
};
