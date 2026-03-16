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
  ui              # shared React components
  config-eslint   # shared eslint config
  config-ts       # shared tsconfig(s)
  config-test     # shared test config (vitest)

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
- Project-scoped schemas/routes/types used by multiple project packages: `<project>-shared`
- Reusable infra constructs/patterns: `packages/infra-patterns`
- Reusable UI components: `packages/ui`
- App-specific logic: inside an app package, then promote when reused.
