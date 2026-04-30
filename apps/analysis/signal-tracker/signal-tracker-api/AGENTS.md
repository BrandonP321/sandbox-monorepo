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
- Database targeting is intentionally stage-based and AWS-only. `SIGNAL_TRACKER_DB_STAGE` defaults to `prod`; use that default until a separate dev Aurora database exists.
- For deployed DB smoke/migrate/verify commands, pin the profile in the command environment, e.g. `AWS_PROFILE=sandbox-admin pnpm --filter signal-tracker-api run db:smoke:deployed`. The AWS SDK credential chain can otherwise use a different default account even if `aws sts get-caller-identity --profile sandbox-admin` succeeds.
- TODO: When the dev DB exists, update local API guidance to use `SIGNAL_TRACKER_DB_STAGE=dev` by default while deployed production stays on `prod`.
- Treat any local API session connected to `prod` as Prod data: avoid destructive/manual data changes and do not add seed/reset scripts against Prod.
