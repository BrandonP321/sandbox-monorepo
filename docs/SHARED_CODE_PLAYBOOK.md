# SHARED_CODE_PLAYBOOK.md — Reuse-first engineering

## Reuse trigger
Extract to `packages/*` when any of these are true:
1. Code is copied across apps.
2. The same concept appears in 2+ apps.
3. It is a platform primitive (API router, contracts, infra patterns).

## Current shared platform packages
- `@repo/api-core`: route registration, local-dev server adapter, response helpers, errors, logging.
- `@repo/api-contracts`: repo-wide web+api schemas/types.
- `@repo/infra-patterns`: CDK constructs for API + SPA deployment defaults.

## Contract naming to avoid collisions
Keep project-specific contracts in `<project>-shared`. Use `@repo/api-contracts` only when the same contract is intentionally shared across projects.

## Extraction workflow
1. Define a small API surface.
2. Add tests in the shared package.
3. Replace app-local implementation with imports.
4. Keep dependencies minimal and justified.
