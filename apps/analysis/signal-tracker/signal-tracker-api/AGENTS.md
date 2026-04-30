# AGENTS.md - signal-tracker-api

Also follow `../AGENTS.md` for Signal Tracker product scope, Google Drive source-of-truth docs, and R1 MVP boundaries.

## Commands

- Dev server: `pnpm --filter signal-tracker-api dev`
- Tests: `pnpm --filter signal-tracker-api test`
- Lint: `pnpm --filter signal-tracker-api lint`
- Typecheck: `pnpm --filter signal-tracker-api typecheck`
- Build: `pnpm --filter signal-tracker-api build`

## Notes

- Shared router logic lives in `src/app/router.ts` and is used by both Lambda and local dev adapters.
- Temporary early-development database convention: local API development may point at the Prod Aurora PostgreSQL database through `../.env.local` to reduce local setup friction and Aurora wake-up slowdowns. Treat this as a short-term convenience while the app is low-traffic and pre-release: avoid destructive/manual data changes, do not add seed/reset scripts against Prod, and revisit this before broader testing, demos, or real user data.
