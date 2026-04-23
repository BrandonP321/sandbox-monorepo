# AGENTS.md - signal-tracker-api

## Commands
- Dev server: `pnpm --filter signal-tracker-api dev`
- Tests: `pnpm --filter signal-tracker-api test`
- Lint: `pnpm --filter signal-tracker-api lint`
- Typecheck: `pnpm --filter signal-tracker-api typecheck`
- Build: `pnpm --filter signal-tracker-api build`

## Notes
- Shared router logic lives in `src/app/router.ts` and is used by both Lambda and local dev adapters.
