# AGENTS.md - signal-tracker-shared

Also follow `../AGENTS.md` for Signal Tracker product scope, Google Drive source-of-truth docs, and R1 MVP boundaries.

## Commands

- Tests: `pnpm --filter @repo/signal-tracker-shared test`
- Lint: `pnpm --filter @repo/signal-tracker-shared lint`
- Typecheck: `pnpm --filter @repo/signal-tracker-shared typecheck`
- Build: `pnpm --filter @repo/signal-tracker-shared build`

## Notes

- Keep this package limited to Signal Tracker-scoped routes, schemas, contracts, and types used by 2+ Signal Tracker packages.
- Topic lifecycle contracts must keep archive and delete distinct: topic archive is reversible/non-destructive, while topic delete is a permanent hard delete. Do not add topic-level `deleted` status or `deletedAt` fields unless a future product decision explicitly changes this.
- Entry lifecycle contracts are separate and may include `deleted` status and `deletedAt` fields.
- Do not put React components, DOM rendering, or visual styling in this package; Signal Tracker-specific UI belongs in `signal-tracker-web`.
- Keep reusable validation semantics in shared schema builders here when the same field rules are needed by API contracts, RTK Query consumers, and forms. Prefer domain-level schema shapes with sensible default validation messages that API and UI can use directly; override messages only when a specific UI materially benefits from different copy.
- Promote code to repo-wide `packages/*` only when it is useful outside the Signal Tracker app family.
- When shared domain or contract logic would prevent duplication across Signal Tracker packages, extract it here with tests instead of leaving app-local copies.
