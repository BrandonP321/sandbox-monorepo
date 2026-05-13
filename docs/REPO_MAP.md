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
  api-contracts   # shared request/response schemas and DTOs
  frontend-config # shared frontend environment/stage config helpers
  infra-patterns  # reusable CDK constructs and deployment helpers
  postman-sync    # repo-wide Postman collection/environment generation and sync tooling
  schema-utils    # repo-wide Zod schema helpers and schema-adjacent predicates
  dashboard-ui    # shared dashboard-oriented React UI primitives and styles
  ui-base         # shared UI behavior primitives and form wiring
  config-eslint   # shared eslint config
  config-ts       # shared tsconfig(s)
  config-test     # shared test config (vitest)
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

Signal Tracker UI may use `@repo/dashboard-ui` for the extracted dashboard primitive system and `@repo/ui-base` for behavior-only primitives. Signal Tracker-specific components belong in `signal-tracker-web`.

## Dependency Direction

- `apps/*` may depend on `packages/*`
- `packages/*` must not depend on `apps/*`

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
- Reusable UI behavior helpers: `packages/ui-base`
- App-specific logic: inside an app package, then promote when reused.

Signal Tracker-specific rule: promote reusable contracts/domain types to `signal-tracker-shared`; promote reusable dashboard primitives to `@repo/dashboard-ui`; promote reusable UI behavior to `@repo/ui-base`; keep product-specific Signal Tracker components in `signal-tracker-web`.
