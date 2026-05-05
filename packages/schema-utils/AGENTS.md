# AGENTS.md - @repo/schema-utils

Also follow the repo root `AGENTS.md` for shared-package dependency direction, testing, and reviewability.

## Scope

- Keep this package focused on app-neutral Zod schema helpers and small schema-adjacent predicates.
- Do not add product/domain concepts, route contracts, UI component behavior, React hooks, request builders, or app workflow policy here.
- Prefer helper names that make normalization semantics explicit, especially around blank strings versus omitted values.
- When extracting helpers from an app package, preserve the existing parser behavior unless the task explicitly asks for a contract change.
- Add focused tests for every exported helper before exporting it from `src/index.ts`.
