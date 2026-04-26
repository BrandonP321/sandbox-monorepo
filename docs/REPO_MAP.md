# REPO_MAP.md — Where things go

## Top-level
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
  infra-patterns  # reusable CDK constructs and deployment helpers
  postman-sync    # repo-wide Postman collection/environment generation and sync tooling
  ui-base         # shared UI behavior primitives and form wiring
  ui              # shared UI package: tokens, styles, utilities, and reusable React primitives
  config-eslint   # shared eslint config
  config-ts       # shared tsconfig(s)
  config-test     # shared test config (vitest)

## Current app families

/apps/analysis/signal-tracker
  signal-tracker-web     # React/Vite web UI
  signal-tracker-api     # Lambda-style TypeScript API
  signal-tracker-shared  # Signal Tracker scoped routes, schemas, and shared types
  signal-tracker-infra   # AWS CDK deployment package

Signal Tracker-specific agent guidance lives in `apps/analysis/signal-tracker/AGENTS.md`.

Signal Tracker UI is intentionally different from other app families: it may use `@repo/ui-base` for behavior-only primitives, but it must not import `@repo/ui` or other styled shared UI packages. Signal Tracker-specific components belong in `signal-tracker-web`.

## Dependency Direction
- apps/* may depend on packages/*
- packages/* must not depend on apps/*

## Naming
- Folders inside a project are `<project>-<type>` (`hello-world-web`, `hello-world-api`, `hello-world-infra`).
- Use `<project>-shared` when code is shared within one project but should not become a repo-wide package.
- Shared packages use `@repo/<name>`.
- Project-specific contracts should live in `<project>-shared`; `@repo/api-contracts` is for repo-wide shared contracts only.

## Where new code should go (rule of thumb)
- API request handling primitives: `packages/api-core`
- Repo-wide shared web/api schemas: `packages/api-contracts`
- Postman collection/environment generation: `packages/postman-sync`
- Project-scoped schemas/routes/types used by multiple project packages: `<project>-shared`
- Reusable infra constructs/patterns: `packages/infra-patterns`
- Reusable UI tokens/utilities/primitives: `packages/ui`
- App-specific logic: inside an app package, then promote when reused.

Signal Tracker-specific rule: promote reusable contracts/domain types to `signal-tracker-shared`; promote reusable UI behavior to `@repo/ui-base`; keep Signal Tracker visual components in `signal-tracker-web`.
