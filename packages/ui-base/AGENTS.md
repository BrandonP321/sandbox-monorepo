# AGENTS.md - @repo/ui-base

Also follow the repo root `AGENTS.md` for shared-package boundaries, testing, and dependency direction.

## Scope

- Keep `@repo/ui-base` behavior-first and style-free.
- Put reusable frontend behavior here only when it is useful across multiple app families or is likely to be copied between apps.
- Do not add product-specific concepts, visual styling, design tokens, or app route/domain assumptions.
- Keep public APIs small and general. Validate new shared behavior with focused tests before exporting it from `src/index.ts`.

## Hooks

- Shared hooks should be framework-level React behavior, not app workflow policy.
- Keep hook tests focused on externally observable behavior, including cleanup/cancellation behavior when timers, subscriptions, or async work are involved.
- Use jsdom only for tests that need browser globals such as `window`, timers tied to browser APIs, or DOM behavior.
