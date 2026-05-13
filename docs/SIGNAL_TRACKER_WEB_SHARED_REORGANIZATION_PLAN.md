# Signal Tracker Web Shared Reorganization Plan

## Reorganization Tracker

Use this checklist as the approval and implementation tracker. Each phase should
be reviewed before starting the next one unless the user explicitly approves a
larger batch.

### Phase 0 - Plan Approval

- [x] Approve the package boundaries: `@repo/dashboard-ui`,
      `@repo/ui-base` subpaths, `@repo/api-contracts`, and
      `@repo/config-test`.
- [x] Approve the dependency graph and circular-dependency guardrails.
- [x] Confirm `@repo/dashboard-ui` is the package name for the extracted styled
      dashboard component system.
- [x] Confirm `@repo/ui-base/notifications`, `@repo/ui-base/rtk-query`, and
      `@repo/ui-base/routing` are the homes for shared functional frontend
      patterns.

### Phase 1 - Shared Behavior Foundation

- [x] Add the `@repo/ui-base/notifications` public surface.
- [x] Move notification state, provider, context, input normalization, fallback,
      and action/type contracts into `@repo/ui-base/notifications`.
- [x] Update Signal Tracker to import notification behavior from
      `@repo/ui-base/notifications` while keeping visual notification renderers
      local for now.
- [x] Add or move focused tests for notification escalation,
      single-versus-multiple mode, dismissal, and nearest-provider clearing.
- [x] Run targeted `@repo/ui-base` and `signal-tracker-web` validation for the
      notification move.

### Phase 2 - Dashboard UI Package Scaffold

- [x] Create `packages/dashboard-ui` with package metadata, TypeScript, ESLint,
      Vitest, Vite, Storybook, README, and AGENTS guidance.
- [x] Add `@repo/dashboard-ui/styles` with the Signal Tracker-derived default
      theme variables and app override guidance.
- [x] Move the dashboard `cn` helper into `@repo/dashboard-ui`.
- [x] Move low-risk visual primitives first: buttons, badges, cards, chips,
      alerts, content headers, layout helpers, loading/empty states, and
      skeletons.
- [x] Update Signal Tracker imports and package dependencies for the first
      dashboard UI batch.
- [x] Verify package tests, package Storybook build, Signal Tracker tests,
      Signal Tracker build, and Signal Tracker Storybook build.

### Phase 3 - Forms, Overlays, And Notification Renderers

- [ ] Move dashboard form visual wrappers and field chrome into
      `@repo/dashboard-ui`.
- [ ] Move dialog, alert dialog, dropdown menu, popover, and related overlay
      primitives into `@repo/dashboard-ui`.
- [ ] Move `Flashbar`, `NotificationAlerts`, and `NotificationFlashbar` into
      `@repo/dashboard-ui`, backed by `@repo/ui-base/notifications`.
- [ ] Preserve current form-local error behavior, root flashbar stacking, and
      unsupported-message pass-through semantics.
- [ ] Add or move focused tests and Storybook stories for the migrated form,
      overlay, and notification-rendering surfaces.
- [ ] Run targeted package and Signal Tracker validation, including visual
      checks for layout-sensitive stories.

### Phase 4 - Routing And App Shell

- [ ] Add `@repo/ui-base/routing` with route registry and path helper types.
- [ ] Move the generic route registry helper out of `signal-tracker-web` while
      keeping actual Signal Tracker route values app-local.
- [ ] Split `AppShell` into route-agnostic dashboard shell pieces and
      TanStack-aware adapter pieces where needed.
- [ ] Move TanStack-aware `AppShell`, `Breadcrumbs`, and `ButtonLink` adapters
      behind `@repo/dashboard-ui/tanstack-router`.
- [ ] Update Signal Tracker router, shell, links, and breadcrumbs to use the
      shared routing helpers and dashboard adapters.
- [ ] Verify routing behavior, active navigation, breadcrumbs, page titles, and
      app shell responsive behavior.

### Phase 5 - RTK Query And API Contracts

- [ ] Extend `@repo/api-contracts` with generic API error message/code helpers.
- [ ] Move generic route-contract request/response helpers into
      `@repo/api-contracts` without RTK-specific return types.
- [ ] Add `@repo/ui-base/rtk-query` with `withErrorMessage`, query/mutation
      wrappers, notification options, and success-only invalidation helpers.
- [ ] Wire RTK Query notifications through `@repo/ui-base/notifications` without
      importing `@repo/dashboard-ui`.
- [ ] Update Signal Tracker endpoint modules to use the shared RTK Query and API
      contract helpers while keeping endpoint definitions and notification copy
      app-local.
- [ ] Verify the existing `errorMessage` contract, success notifications,
      failure notifications, and success-only invalidation behavior.

### Phase 6 - Shared Test Setup

- [ ] Add a shared DOM setup export to `@repo/config-test`.
- [ ] Move Testing Library matcher registration, `matchMedia`, and `scrollTo`
      setup into the shared DOM setup.
- [ ] Update Signal Tracker, Hello World, and browser extension Vitest configs
      or setup files to use the shared setup where applicable.
- [ ] Verify app test suites still receive DOM matchers and browser polyfills.

### Phase 7 - Documentation And Guidance

- [ ] Update `docs/REPO_MAP.md` with `@repo/dashboard-ui` and new
      `@repo/ui-base` subpaths.
- [ ] Update `docs/SHARED_CODE_PLAYBOOK.md` for the approved extraction
      boundaries.
- [ ] Update Signal Tracker AGENTS/README guidance so Signal Tracker can import
      `@repo/dashboard-ui` while still avoiding the older `@repo/ui` styled
      package.
- [ ] Add package-level AGENTS guidance for `@repo/dashboard-ui` and any new
      `@repo/ui-base` subpath conventions.

### Phase 8 - Final Cleanup And Full Validation

- [ ] Remove obsolete local exports, stale imports, duplicate helpers, and
      unused package dependencies from `signal-tracker-web`.
- [ ] Confirm no shared package imports app-local or Signal Tracker-specific
      code.
- [ ] Confirm no circular dependency was introduced among `@repo/dashboard-ui`,
      `@repo/ui-base`, `@repo/api-contracts`, and Signal Tracker packages.
- [ ] Run full relevant validation: shared package checks, Signal Tracker web
      checks, root `pnpm format:check`, and `git diff --check`.
- [ ] Update this tracker as each phase is completed.

## Goal

Move reusable `signal-tracker-web` code into focused shared packages so the next
frontend app can start with the same dashboard-oriented foundation without
copying Signal Tracker files.

This is an extraction plan, not an implementation checklist for one giant
move. The main design constraint is to keep visual UI, UI behavior, API client
policy, app routing, and test setup in separate ownership boundaries.

## Package Direction

### New package: `@repo/dashboard-ui`

Create `packages/dashboard-ui` for reusable, styled dashboard primitives built
from the current Signal Tracker `src/components/ui` foundation.

Name rationale:

- `dashboard-ui` describes the shape of the package better than a product name.
- The current components are dense app/dashboard primitives: shell, flashbar,
  alerts, cards, forms, page/section headers, badges, layout helpers, dialogs,
  menus, popovers, and empty/loading/not-found states.
- It avoids overloading the existing `@repo/ui` package, which currently owns
  a separate SCSS-based Analyst Core design-system track.

Initial package contract:

- `@repo/dashboard-ui`: route-agnostic React primitives and composed dashboard
  components.
- `@repo/dashboard-ui/styles`: Tailwind v4 theme, CSS variables, base styles,
  and default Signal Tracker-derived colors.
- `@repo/dashboard-ui/icons`: generic dashboard icon exports or semantic icon
  registry, if useful after moving the first component batch.
- `@repo/dashboard-ui/tanstack-router`: optional TanStack Router adapters such
  as route-aware links, breadcrumbs, and shell integration. These adapters can
  use route-registry helpers from `@repo/ui-base`, but should stay in a subpath
  so apps that do not use TanStack Router can still consume the core UI package.

The package should depend on `@repo/ui-base` for behavior-only form helpers and
responsive hooks. It should not depend on Signal Tracker packages.

### Existing package: `@repo/ui-base`

Use `@repo/ui-base` as the shared frontend behavior package. It should stay
style-free and dashboard-design-system-free, but it can own common functional
patterns that all repo frontends are expected to follow.

Good fits:

- Additional React Hook Form control behavior that is not tied to dashboard
  markup.
- Schema-derived form metadata helpers.
- Browser/runtime hooks that affect behavior rather than presentation.
- Notification context, providers, nearest-provider pass-through behavior,
  single-versus-multiple notification state, input normalization, and
  notification action/types.
- RTK Query hook wrappers and cache helpers.
- App route registry helpers and route path types.

Suggested subpaths:

- `@repo/ui-base/notifications`
- `@repo/ui-base/rtk-query`
- `@repo/ui-base/routing`

Do not move Tailwind classes, theme tokens, icons, layout chrome, alerts,
dialogs, flashbars, or notification renderers here. `NotificationAlerts`,
`NotificationFlashbar`, and the visual `Flashbar`/`Alert` components should
stay in `@repo/dashboard-ui` because they render dashboard UI.

RTK Query utilities should live in `@repo/ui-base/rtk-query` rather than a
separate package:

- `src/api/cacheTags.ts`
- `src/api/rtkQueryHooks/getQuery.ts`
- `src/api/rtkQueryHooks/getMutation.ts`
- `src/api/rtkQueryHooks/rtkQueryHooksShared.ts`
- The generic parts of `src/api/rtkQueryHooks/apiNotifications.ts`

Notification behavior should use `@repo/ui-base/notifications`, not
`@repo/dashboard-ui`, so API utilities can participate in the shared
notification policy without importing a visual package. The RTK wrapper should
still allow callers to override the API error parser and notification behavior
where needed.

### Existing package: `@repo/api-contracts`

Extend `@repo/api-contracts` for API-error and route-contract helpers that are
not Signal Tracker specific.

Move or generalize:

- Generic `getApiErrorMessage` behavior from `src/api/apiError.ts`.
- Generic `isApiErrorCode(error, code: string)` logic.
- Generic route-contract helpers behind `src/api/routeContract.ts`, without
  returning RTK-specific `FetchArgs`.

Keep Signal Tracker route names, schemas, and domain error-code types in
`@repo/signal-tracker-shared`.

App route registry helpers should live in `@repo/ui-base/routing` rather than a
separate package:

- `defineAppRoutes` from `src/routeRegistry.ts`.
- Route path and static route path helper types.
- Framework-neutral route-definition helpers used by dashboard shell adapters.

Each app should still define its own route registry locally. `@repo/ui-base`
should own the registry builder and types, not the actual app routes. TanStack
Router-specific link and route-resolution UI adapters should stay in
`@repo/dashboard-ui/tanstack-router` so `@repo/ui-base/routing` does not need to
depend on TanStack Router for generic route typing.

### Existing package: `@repo/config-test`

Extend `@repo/config-test` with a shared DOM setup file.

Move or generalize:

- `@testing-library/jest-dom` setup.
- `window.matchMedia` polyfill.
- `window.scrollTo` no-op polyfill.

Target shape:

```ts
setupFiles: ["@repo/config-test/setup-dom"];
```

Use `@testing-library/jest-dom/vitest` in the shared setup so every Vitest DOM
package gets the same matcher registration.

## Dependency Graph

The extraction should preserve this one-way dependency direction:

```text
apps/* -> @repo/dashboard-ui, @repo/ui-base, @repo/api-contracts,
          project-scoped shared packages

@repo/dashboard-ui -> @repo/ui-base

@repo/ui-base/rtk-query
  -> @repo/ui-base/notifications
  -> @repo/api-contracts, if using the default API error parser

@repo/api-contracts -> no UI package dependencies

@repo/dashboard-ui/tanstack-router
  -> @repo/dashboard-ui
  -> @repo/ui-base/routing
  -> @tanstack/react-router
```

Guardrails:

- `@repo/ui-base` must not import `@repo/dashboard-ui`, `@repo/ui`, or any app
  package.
- `@repo/dashboard-ui` must not import Signal Tracker packages.
- `@repo/api-contracts` must not import `@repo/ui-base` or visual UI packages.
- `@repo/signal-tracker-shared` should remain domain/contracts-only and should
  not import UI packages.
- Keep RTK Query exports behind `@repo/ui-base/rtk-query`; do not re-export them
  from the root `@repo/ui-base` barrel unless every UI-base consumer should pay
  that dependency cost.
- Keep TanStack Router dependencies out of `@repo/ui-base/routing`; TanStack
  belongs in `@repo/dashboard-ui/tanstack-router` or app-local router code.

## Component Inventory

### Move to `@repo/dashboard-ui`

These are good first-class dashboard UI candidates:

- `Alert`
- `AlertDialog`
- `Badge`
- `Button`
- `Card`
- `Chip`
- `ContentHeader`
- `Dialog`
- `DropdownMenu`
- `EmptyState`
- `Flashbar`
- `Form` visual wrappers and field chrome
- `IconStack`
- `Layout`
- `LoadingState`
- `NotificationAlerts` and `NotificationFlashbar` visual renderers
- `PageNotFound`
- `Popover`
- `ResourceNotFound`
- `Skeleton`
- `SourceIcon`, if it remains framed as a generic favicon/source marker
- `semanticIcons`, limited to product-neutral icons

Move `src/lib/utils.ts` with this package as the dashboard package `cn` helper.
It is styling infrastructure because it combines `clsx` and `tailwind-merge`.

Move `src/index.css` into the dashboard package as `@repo/dashboard-ui/styles`.
Signal Tracker's current colors should become the default theme variables.

### Move to `@repo/ui-base`

These are functional rather than visual and should become shared frontend
behavior:

- `NotificationProvider`
- `ErrorNotificationProvider`
- `useNotifications`
- `notificationContext.ts`
- `notificationFallback.ts`
- `notificationInputs.ts`
- `Notifications/types.ts`
- `src/api/cacheTags.ts`
- `src/api/rtkQueryHooks/*`
- `defineAppRoutes` and route path helper types from `src/routeRegistry.ts`

### Move to `@repo/dashboard-ui/tanstack-router`

These currently depend on TanStack Router and should not be forced into the
core UI import path:

- `AppShell`, or at least its TanStack-aware root/`Outlet` integration.
- `Breadcrumbs`
- `ButtonLink`

Recommended split for `AppShell`:

- Core shell layout, sidebar, header, scroll behavior, flashbar placement, and
  route display contracts live in `@repo/dashboard-ui`.
- TanStack-specific active route detection, `Outlet`, `Link`, and path param
  resolution live in `@repo/dashboard-ui/tanstack-router`.

### Keep app-local in Signal Tracker

Do not move product-specific code from `src/components/signal-tracker`.

Also keep app-local:

- Actual `appRoutes` values from `src/routeRegistry.ts`.
- `router.tsx` route tree.
- `store.ts` and `storeHooks.ts`, unless a later app repeats the exact Redux
  store setup pattern enough to justify a tiny helper.
- Endpoint modules such as `src/api/topics/topicApi.ts` and
  `src/api/evidence/evidenceApi.ts`.
- Signal Tracker-specific error-code typing and route contract registry.
- Product icon registries such as `signalTrackerIcons`.

## Theme And CSS Plan

`@repo/dashboard-ui/styles` should own:

- `@import "tailwindcss";`
- the Tailwind `@theme inline` mapping for semantic token names
- default `:root` CSS variables using the current Signal Tracker colors
- shared base styles for `html`, `body`, `#root`, focus outlines, borders, and
  pointer cursor behavior

Apps should be able to override the dashboard theme by importing package styles
first and then redefining variables:

```css
@import "@repo/dashboard-ui/styles";

:root {
  --background: #f7fafc;
  --primary: oklch(0.48 0.12 220);
}
```

If a consuming app compiles Tailwind from its own CSS entrypoint, the app may
need an explicit Tailwind source directive for the shared package source. The
implementation should verify this with both `signal-tracker-web` and
`@repo/dashboard-ui` Storybook builds before removing app-local styles.

## API And Data Plan

Keep endpoint ownership in apps. Move reusable RTK Query mechanics out.

Target split:

- `@repo/api-contracts`
  - API error schema
  - API error message extraction
  - generic route contract request/response helpers
- `@repo/ui-base/notifications`
  - notification context and providers
  - nearest-provider escalation and clearing semantics
  - notification action/type contracts used by API wrappers and UI renderers
- `@repo/ui-base/rtk-query`
  - `withErrorMessage`
  - `getQuery`
  - `getMutation`
  - `invalidateTagsOnSuccess`
  - notification option types and hooks that call `@repo/ui-base/notifications`
- `signal-tracker-web/src/api`
  - `signalTrackerApi`
  - endpoint definitions
  - Signal Tracker route wrapper that binds `signalTrackerRouteContracts`
  - Signal Tracker hook exports and notification copy

The extraction should preserve the current `errorMessage` contract: do not
replace or reshape RTK Query's original `error` field.

## Routing Plan

Target split:

- `@repo/ui-base/routing`
  - generic route registry builder
  - app route key/path/static-path types
- `@repo/dashboard-ui/tanstack-router`
  - TanStack-aware links, breadcrumbs, shell route resolution, and optional
    route param helpers
- `signal-tracker-web`
  - actual route definitions
  - actual TanStack route tree
  - product shell route list and route titles

This lets future apps reuse typed route registries without inheriting Signal
Tracker paths or product navigation.

## Test Setup Plan

Target split:

- `@repo/config-test`
  - keep `baseConfig`
  - add `setup-dom` export for Testing Library matchers and browser polyfills
- app packages
  - set `setupFiles` to `@repo/config-test/setup-dom`
  - keep app-specific test fixtures and render helpers local until repeated

The shared DOM setup should cover both Signal Tracker and Hello World's current
`matchMedia` setup. Signal Tracker's `scrollTo` no-op should move there too.

## Suggested Extraction Sequence

1. Create `@repo/dashboard-ui` skeleton.
   - Copy package shape from `packages/ui`.
   - Use Tailwind/Radix/CVA dependencies from `signal-tracker-web`.
   - Add package-level Storybook and focused unit tests.
   - Add `AGENTS.md` documenting the dashboard UI boundary.

2. Move styles and low-risk primitives first.
   - Move `cn`, `styles`, `Button`, `Badge`, `Card`, `Chip`, `Alert`,
     `ContentHeader`, `Layout`, `LoadingState`, `EmptyState`, and `Skeleton`.
   - Update Signal Tracker imports.
   - Verify package tests, package Storybook, app tests, app build, and app
     Storybook.

3. Move form and overlay primitives.
   - Move `Form` visual wrappers, `Dialog`, `AlertDialog`, `DropdownMenu`,
     `Popover`, `Flashbar`, `NotificationAlerts`, and
     `NotificationFlashbar`.
   - Keep `@repo/ui-base` as the behavior dependency for RHF and responsive
     hooks.
   - Preserve nearest-provider notification behavior by first moving the
     notification context/providers into `@repo/ui-base/notifications`.

4. Move route-aware UI behind subpath exports.
   - Move `ButtonLink`, `Breadcrumbs`, and the TanStack-aware `AppShell`
     adapter to `@repo/dashboard-ui/tanstack-router`.
   - Keep route definitions and product navigation in Signal Tracker.

5. Extract RTK Query utilities into `@repo/ui-base`.
   - Move `invalidateTagsOnSuccess`, `withErrorMessage`, and wrapper logic.
   - Replace direct dashboard UI notification imports with
     `@repo/ui-base/notifications`.
   - Keep Signal Tracker hook notification copy in app endpoint modules.

6. Extract API contract helpers.
   - Extend `@repo/api-contracts` with generic API error helpers and generic
     route contract helpers.
   - Leave Signal Tracker schemas and route registry in
     `@repo/signal-tracker-shared`.

7. Extract route registry and test setup helpers.
   - Move route registry helpers into `@repo/ui-base/routing`.
   - Extend `@repo/config-test` with `setup-dom`.
   - Update apps that currently duplicate setup behavior.

8. Update guidance and repo docs.
   - Update `docs/REPO_MAP.md`.
   - Update `docs/SHARED_CODE_PLAYBOOK.md`.
   - Update Signal Tracker AGENTS/README rules that currently say styled shared
     UI packages are forbidden. The new rule should forbid `@repo/ui` for
     Signal Tracker, but allow the explicitly extracted `@repo/dashboard-ui`.

## Validation Expectations

For each extraction batch:

- Shared package: `lint`, `typecheck`, `test`, and `build`.
- `signal-tracker-web`: `lint`, `typecheck`, `test`, `build`, and
  `build-storybook`.
- Root: `pnpm format:check` and `git diff --check`.

For visual or layout-sensitive batches, also run Storybook and inspect the
affected stories through Playwright at narrow and wide widths.

## Key Risks

- Tailwind source scanning and CSS import order can silently drop shared package
  classes or make app overrides ineffective. Verify this before removing the
  app-local CSS.
- `AppShell`, breadcrumbs, and button links are currently TanStack-aware. Keep
  TanStack dependencies behind a subpath or adapter so the core UI package stays
  usable by other routing stacks.
- RTK Query notification wrappers currently import the local UI notification
  context. Move the context/provider layer to `@repo/ui-base/notifications`
  before moving the wrappers so API utilities do not depend on the dashboard
  package.
- Circular dependency risk is highest around notifications: `@repo/ui-base`
  should own state and actions, while `@repo/dashboard-ui` should only render
  those notifications. Do not let `@repo/ui-base` import dashboard alerts or
  flashbars.
- `@repo/ui` and `@repo/dashboard-ui` will coexist. Do not try to merge them as
  part of this plan; they serve different styling tracks today.
- Move product-neutral primitives only. Product workflows, Signal Tracker route
  names, domain icon choices, API endpoint definitions, and contract-backed form
  schemas stay in Signal Tracker packages.
