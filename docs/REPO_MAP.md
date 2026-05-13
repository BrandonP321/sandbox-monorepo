# REPO_MAP.md — Where things go

## Top-level

```text
/apps
  <domain>/
    <project>/
      <project>-web    # web UI app (React/TS)
      <project>-api    # backend/API app (single Lambda, multi-route)
      <project>-infra  # infra/deploy app (CDK)
      <project>-shared # project-scoped shared code used by 2+ packages in that project

/packages
  api-core        # shared API runtime/router/error/logging/helpers
  api-contracts   # shared request/response schemas, DTOs, and generic API contract helpers
  frontend-config # shared frontend environment/stage config helpers
  infra-patterns  # reusable CDK constructs and deployment helpers
  postman-sync    # repo-wide Postman collection/environment generation and sync tooling
  schema-utils    # repo-wide Zod schema helpers and schema-adjacent predicates
  dashboard-ui    # shared dashboard-oriented React UI primitives, styles, and route-aware adapters
  ui-base         # shared style-free UI behavior primitives and frontend helper subpaths
  config-eslint   # shared eslint config
  config-ts       # shared tsconfig(s)
  config-test     # shared test config (vitest) and DOM setup
```

## Current app families

```text
/apps/analysis/signal-tracker
  signal-tracker-web     # React/Vite web UI
  signal-tracker-api     # Lambda-style TypeScript API
  signal-tracker-shared  # Signal Tracker scoped routes, schemas, and shared types
  signal-tracker-infra   # AWS CDK deployment package
```

Signal Tracker-specific agent guidance lives in `apps/analysis/signal-tracker/AGENTS.md`.

Signal Tracker UI may use `@repo/dashboard-ui` for the extracted dashboard
primitive system and `@repo/ui-base` for behavior-only primitives. Signal
Tracker-specific components belong in `signal-tracker-web`.

## Shared Frontend Surfaces

- `@repo/dashboard-ui`: route-agnostic styled dashboard primitives, dashboard
  layout helpers, form chrome, overlay primitives, visual notification
  renderers, and the `cn` styling helper.
- `@repo/dashboard-ui/styles`: Tailwind v4 dashboard theme, CSS variables, base
  styles, and package source directives. Apps import this once from their CSS
  entrypoint before app-level overrides.
- `@repo/dashboard-ui/tanstack-router`: TanStack Router-aware dashboard
  adapters such as app shell integration, breadcrumbs, button links, and
  route-aware not-found handling.
- `@repo/ui-base`: style-free UI behavior primitives, React Hook Form control
  behavior, shared form helpers, and behavior-only hooks.
- `@repo/ui-base/notifications`: notification providers, state, actions,
  input normalization, nearest-provider clearing, and provider escalation.
- `@repo/ui-base/rtk-query`: RTK Query wrapper mechanics, `errorMessage`
  derivation, notification dispatch policy, and success-only invalidation
  helpers.
- `@repo/ui-base/routing`: framework-neutral app route registry helpers and
  route path/param types. App route values stay app-local.
- `@repo/config-test/setup-dom`: Testing Library matcher registration and
  browser polyfills for Vitest DOM suites.

## Dependency Direction

- `apps/*` may depend on `packages/*`
- `packages/*` must not depend on `apps/*`
- `@repo/dashboard-ui` may depend on `@repo/ui-base` for behavior, but
  `@repo/ui-base` must not import dashboard UI, app code, or router-specific UI
  adapters.
- `@repo/ui-base/routing` stays framework-neutral; TanStack Router code belongs
  in `@repo/dashboard-ui/tanstack-router` or app-local router modules.
- `@repo/api-contracts` must not depend on UI packages.

## Naming

- Folders inside a project are `<project>-<type>` (`<project>-web`, `<project>-api`, `<project>-infra`).
- Use `<project>-shared` when code is shared within one project but should not become a repo-wide package.
- Shared packages use `@repo/<name>`.
- Project-specific contracts should live in `<project>-shared`; `@repo/api-contracts` is for repo-wide shared contracts only.

## Where new code should go (rule of thumb)

- API request handling primitives: `packages/api-core`
- Frontend environment/stage resolution helpers: `packages/frontend-config`
- Repo-wide shared web/api schemas: `packages/api-contracts`
- Repo-wide reusable Zod schema helpers: `packages/schema-utils`
- Postman collection/environment generation: `packages/postman-sync`
- Project-scoped schemas/routes/types used by multiple project packages: `<project>-shared`
- Reusable infra constructs/patterns: `packages/infra-patterns`
- Reusable dashboard UI primitives and styles: `packages/dashboard-ui`
- Reusable UI behavior helpers, including notifications, RTK Query wrappers,
  and route registry types: `packages/ui-base`
- App-specific logic: inside an app package, then promote when reused.

Signal Tracker-specific rule: promote reusable contracts/domain types to `signal-tracker-shared`; promote reusable dashboard primitives to `@repo/dashboard-ui`; promote reusable UI behavior to `@repo/ui-base`; keep product-specific Signal Tracker components in `signal-tracker-web`.
