# Signal Tracker Migrations

This directory contains Drizzle-generated SQL migrations and snapshot metadata
for the Signal Tracker PostgreSQL schema.

Generate migrations from `src/db/schema.ts` with:

```bash
pnpm --filter signal-tracker-api run db:generate
```

Apply migrations explicitly with `db:migrate:deployed` after reviewing the
generated SQL. The command uses `SIGNAL_TRACKER_DB_STAGE` when set and defaults
to `prod`.
