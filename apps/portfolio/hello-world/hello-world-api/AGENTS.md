# AGENTS.md - hello-world-api

## Commands
- Dev server: `pnpm --filter hello-world-api dev`
- Tests: `pnpm --filter hello-world-api test`
- Lint: `pnpm --filter hello-world-api lint`
- Typecheck: `pnpm --filter hello-world-api typecheck`
- Build: `pnpm --filter hello-world-api build`

## Notes
- Shared router logic lives in `src/app/router.ts` and is used by both Lambda and local dev adapters.
