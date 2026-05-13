# SHARED_CODE_PLAYBOOK.md — Reuse-first engineering

## Reuse trigger

Extract to `packages/*` when any of these are true:

1. Code is copied across apps.
2. The same concept appears in 2+ apps.
3. It is a platform primitive (API router, contracts, infra patterns).

## Current shared platform packages

- `@repo/api-core`: route registration, local-dev server adapter, response helpers, errors, logging.
- `@repo/api-contracts`: repo-wide web+api schemas/types plus generic API error and route-contract helpers.
- `@repo/frontend-config`: browser-safe frontend environment/stage config helpers.
- `@repo/infra-patterns`: CDK constructs for API + SPA deployment defaults.
- `@repo/dashboard-ui`: reusable dashboard-oriented React UI primitives and styles.
- `@repo/ui-base`: behavior-only UI primitives, form wiring, notifications, routing helpers, and RTK Query wrappers.
- `@repo/config-test`: shared Vitest config and DOM setup helpers.

## Approved frontend extraction boundaries

- `@repo/dashboard-ui` owns styled dashboard UI: primitives, layout helpers,
  form chrome, dialogs, popovers, menus, flashbars, visual notification
  renderers, semantic dashboard icons, the dashboard Tailwind theme, and the
  `cn` styling helper.
- `@repo/dashboard-ui/styles` is the dashboard stylesheet import. Apps should
  import it before app-local CSS variable overrides.
- `@repo/dashboard-ui/tanstack-router` owns TanStack Router-aware dashboard
  adapters. Keep router dependencies out of the root dashboard UI surface when
  they are not required by plain component consumers.
- `@repo/ui-base` stays style-free and behavior-only. It can own form behavior,
  runtime hooks, notification state, route registry types, and RTK Query
  mechanics, but not dashboard markup, Tailwind classes, icons, or app-specific
  workflow policy.
- `@repo/ui-base/notifications` owns notification providers, state, actions,
  normalization, nearest-provider clearing, and escalation. Visual renderers
  belong in `@repo/dashboard-ui`.
- `@repo/ui-base/rtk-query` owns generic RTK Query hook wrapping mechanics,
  `errorMessage` derivation, notification dispatch through
  `@repo/ui-base/notifications`, and success-only invalidation helpers.
  Endpoint modules, cache tag names, app route binding, and user-facing copy
  stay in the consuming app.
- `@repo/ui-base/routing` owns framework-neutral route registry helpers and
  path/param types. Actual route values and router trees stay app-local;
  TanStack-aware UI belongs in `@repo/dashboard-ui/tanstack-router`.
- `@repo/api-contracts` owns generic API error helpers and framework-neutral
  route-contract helpers. Project route names, schemas, and domain error-code
  unions stay in the project-scoped shared package.
- `@repo/config-test/setup-dom` owns repeated DOM test setup such as
  `@testing-library/jest-dom/vitest`, `matchMedia`, and `scrollTo`.

Dependency guardrails:

- `apps/*` may depend on shared packages.
- `@repo/dashboard-ui` may depend on `@repo/ui-base`.
- `@repo/ui-base` must not depend on `@repo/dashboard-ui`, app code, or
  router-specific UI adapters.
- `@repo/api-contracts` must not depend on UI packages.

## Contract naming to avoid collisions

Keep project-specific contracts in `<project>-shared`. Use `@repo/api-contracts` only when the same contract is intentionally shared across projects.

## Signal Tracker reuse rule

For `apps/analysis/signal-tracker`, keep product-specific UI components inside
`signal-tracker-web`. Use `@repo/dashboard-ui` for reusable dashboard
primitives and `@repo/ui-base` for behavior-only UI abstractions.

When Signal Tracker work reveals reusable behavior that belongs in `@repo/ui-base` or another shared package it already depends on, prefer a small tested shared-package expansion over repeated app-local code. Keep style, markup, and product-specific composition out of `@repo/ui-base`.

## Extraction workflow

1. Define a small API surface.
2. Add tests in the shared package.
3. Replace app-local implementation with imports.
4. Keep dependencies minimal and justified.
