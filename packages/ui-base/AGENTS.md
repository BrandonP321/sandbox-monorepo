# AGENTS.md - @repo/ui-base

Also follow the repo root `AGENTS.md` for shared-package boundaries, testing, and dependency direction.

## Scope

- Keep `@repo/ui-base` behavior-first and style-free.
- Put reusable frontend behavior here only when it is useful across multiple app families or is likely to be copied between apps.
- Do not add product-specific concepts, visual styling, design tokens, or app route/domain assumptions.
- Keep public APIs small and general. Validate new shared behavior with focused tests before exporting it from `src/index.ts`.

## Public Subpaths

- Keep optional or dependency-heavy surfaces behind package subpaths when not
  every `@repo/ui-base` consumer should load them.
- `@repo/ui-base/notifications` owns notification behavior, not visual
  notification renderers.
- `@repo/ui-base/routing` owns framework-neutral route registry helpers, not
  router adapters or app route values.
- `@repo/ui-base/rtk-query` owns RTK Query wrapper mechanics, not endpoint
  definitions or app notification copy.
- Do not re-export RTK Query or router-specific helpers from the root
  `@repo/ui-base` barrel unless every UI-base consumer should pay that
  dependency and policy cost.

## Notifications

- `@repo/ui-base/notifications` owns notification providers, context, action
  and message types, input normalization, nearest-provider clearing, and
  unsupported-message escalation.
- Do not import dashboard alerts, flashbars, icons, Tailwind classes, or app
  copy into notification behavior.
- Visual renderers belong in designed packages such as `@repo/dashboard-ui`.

## Routing

- `@repo/ui-base/routing` owns framework-neutral route registry and route path
  helper types only.
- Do not import TanStack Router, React Router, app route registries, app route
  values, visual components, or app shell code into routing helpers.
- Keep each app's actual route values app-local; shared routing helpers should
  preserve literal types and extract path params without knowing the app.

## RTK Query

- `@repo/ui-base/rtk-query` owns reusable RTK Query hook wrapping mechanics,
  `errorMessage` derivation, success-only invalidation helpers, and notification
  dispatch through `@repo/ui-base/notifications`.
- Do not import app endpoint modules, app route registries, cache tag unions,
  domain error-code unions, or visual notification renderers into RTK helpers.
- Keep endpoint definitions, cache tag names, and user-facing notification copy
  in the consuming app.

## Hooks

- Shared hooks should be framework-level React behavior, not app workflow policy.
- Responsive hooks in `@repo/ui-base` must remain behavior-only and style-free.
- `useMediaQuery` and `useMinBreakpoint` are allowed for runtime behavior changes that CSS cannot express, such as default-open behavior, interaction behavior, chart density, virtualization, or data fetching strategy.
- Do not use responsive hooks as the default mechanism for spacing, stacking, hiding/showing, grid changes, sticky layout, visual orientation, or normal responsive presentation; use CSS, Tailwind utilities, or container queries for those.
- Use `useSyncExternalStore` with browser APIs that expose mutable state plus subscription events.
- Do not attach per-instance `window` resize listeners for responsive hooks; share browser subscriptions by query where applicable.
- Named breakpoint helpers must stay aligned with Tailwind's configured or default breakpoint scale.
- Keep hook tests focused on externally observable behavior, including cleanup/cancellation behavior when timers, subscriptions, or async work are involved.
- Responsive hook tests should cover subscription sharing, cleanup, fallback behavior, and observable updates.
- Use jsdom only for tests that need browser globals such as `window`, timers tied to browser APIs, or DOM behavior.
