# REPO_MAP.md — Where things go

## Top-level
/apps
  <project>-web      # web UI app (React/TS)
  <project>-api      # backend/API app (TS)

/packages
  shared             # generic TS utilities (pure logic, no UI)
  data               # data ingestion/adapters/validation (econ sources, csv parsing, etc.)
  api-contracts      # shared types/contracts (zod schemas, DTOs, OpenAPI if used)
  ui                 # shared React components (design-system-lite)
  config-eslint      # shared eslint config
  config-ts          # shared tsconfig(s)
  config-test        # shared test config (vitest/jest)

## Dependency Direction
- apps/* may depend on packages/*
- packages/* must not depend on apps/*
- Prefer stable layering:
  - ui depends on shared (and optionally api-contracts)
  - data depends on shared (and optionally api-contracts)
  - api-contracts depends only on shared

## Naming
- Apps: <project>-web / <project>-api
- Packages: short nouns (shared, data, ui, api-contracts, config-*)

## Where new code should go (rule of thumb)
- Pure logic used in 2+ places: packages/shared
- Data parsing/validation/adapters: packages/data
- Shared request/response schemas: packages/api-contracts
- UI components reused across apps: packages/ui
- App-specific logic: inside the app, but promote to packages if copied or likely to be reused.
