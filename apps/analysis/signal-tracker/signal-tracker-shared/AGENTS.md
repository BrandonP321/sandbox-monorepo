# AGENTS.md - signal-tracker-shared

Also follow `../AGENTS.md` for Signal Tracker product scope, Google Drive source-of-truth docs, and R1 MVP boundaries.

## Commands

- Tests: `pnpm --filter @repo/signal-tracker-shared test`
- Lint: `pnpm --filter @repo/signal-tracker-shared lint`
- Typecheck: `pnpm --filter @repo/signal-tracker-shared typecheck`
- Build: `pnpm --filter @repo/signal-tracker-shared build`

## Notes

- Keep this package limited to Signal Tracker-scoped routes, schemas, contracts, and types used by 2+ Signal Tracker packages.
- Do not put React components, DOM rendering, or visual styling in this package; Signal Tracker-specific UI belongs in `signal-tracker-web`.
- Promote code to repo-wide `packages/*` only when it is useful outside the Signal Tracker app family.
- When shared domain or contract logic would prevent duplication across Signal Tracker packages, extract it here with tests instead of leaving app-local copies.
