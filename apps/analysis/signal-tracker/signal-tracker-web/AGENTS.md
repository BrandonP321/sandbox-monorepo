# AGENTS.md - signal-tracker-web

Also follow `../AGENTS.md` for Signal Tracker product scope, Google Drive source-of-truth docs, and R1 MVP boundaries.

## Commands

- Dev server: `pnpm --filter signal-tracker-web dev`
- Tests: `pnpm --filter signal-tracker-web test`
- Lint: `pnpm --filter signal-tracker-web lint`
- Typecheck: `pnpm --filter signal-tracker-web typecheck`
- Build: `pnpm --filter signal-tracker-web build`

## Notes

- Configure API base URL with `VITE_API_URL`.
- Do not import `@repo/ui`, `packages/ui`, or other styled shared UI packages.
- Use `@repo/ui-base` only for behavior abstractions; keep Signal Tracker-specific UI components, markup, and styling in this web package.
- If behavior is duplicated across Signal Tracker components and is general enough for reuse, extend `@repo/ui-base` with tests instead of copying it locally.
- Keep looking for component boundaries and reusable utilities as UI work grows; make small refactors when they keep the feature implementation clear and sustainable.
