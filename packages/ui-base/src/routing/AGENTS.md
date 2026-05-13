# AGENTS.md - @repo/ui-base/routing

Also follow `../../AGENTS.md` for the package-wide behavior-only boundary.

## Scope

- Own framework-neutral route registry builders and route path/param helper
  types.
- Keep actual app route values, product navigation models, route titles, and
  route trees in the consuming app.
- Do not import TanStack Router, React Router, dashboard shell components,
  app-local route registries, app packages, or visual UI.
- Preserve literal route types and path parameter inference for callers.

## Tests

- Add type-level or runtime tests that protect route key/path inference, path
  parameter extraction, static path detection, and duplicate-key behavior when
  the registry contract changes.
