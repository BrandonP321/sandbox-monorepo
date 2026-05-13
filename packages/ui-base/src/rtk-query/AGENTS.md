# AGENTS.md - @repo/ui-base/rtk-query

Also follow `../../AGENTS.md` for the package-wide behavior-only boundary.

## Scope

- Own reusable RTK Query mechanics: query/mutation hook wrappers,
  `errorMessage` derivation, notification dispatch through
  `@repo/ui-base/notifications`, and success-only cache invalidation helpers.
- Keep endpoint definitions, base API setup, route-contract binding, cache tag
  name unions, domain error-code unions, and user-facing notification copy in
  the consuming app.
- Preserve RTK Query's original `error` value. Add derived fields such as
  `errorMessage` without reshaping or replacing the original error.
- Do not import app packages, dashboard UI, visual notification renderers,
  route registries, or product-specific error parsers.

## Tests

- Add focused tests for `errorMessage`, notification dispatch options,
  suppressed errors, success messages, and success-only invalidation when those
  wrapper contracts change.
