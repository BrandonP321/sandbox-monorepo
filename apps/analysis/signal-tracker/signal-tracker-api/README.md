# Signal Tracker API

Lambda-style TypeScript API with a local dev server that shares the same handler logic.

## Local development

```bash
pnpm --filter signal-tracker-api dev
```

The server listens on `http://localhost:3001` by default.
For local development only, the API loads
`apps/analysis/signal-tracker/.env.local` automatically when that file exists.
Use `apps/analysis/signal-tracker/.env.example` as the template.
Startup checks the `sandbox-admin` AWS CLI profile first and runs
`pnpm aws:login:sandbox` before the API server starts if the profile is not
currently logged in.

## Database Workflow

Topic create/read/list/lifecycle routes use PostgreSQL-backed durable
persistence after the database migrations have been applied.

`POST /get-health` intentionally remains DB-free so health checks still work
while Aurora is paused or resuming.

### Database Target

Signal Tracker API processes always use Aurora PostgreSQL through the AWS Data
API. The runtime reads `SIGNAL_TRACKER_DB_STAGE` and defaults to `prod` when the
stage is omitted.

```bash
cp apps/analysis/signal-tracker/.env.example apps/analysis/signal-tracker/.env.local
# Optional today because prod is the default:
# Set SIGNAL_TRACKER_DB_STAGE=prod
```

TODO: When the separate dev Aurora database exists, set local development to
`SIGNAL_TRACKER_DB_STAGE=dev` and keep deployed production Lambda on `prod`.

Until then, local API development defaults to the Prod Aurora database. Treat
this as Prod data: avoid destructive/manual data changes and do not add
seed/reset scripts.

### Drizzle migrations

Migrations are generated from `src/db/schema.ts` into `drizzle/`:

```bash
pnpm --filter signal-tracker-api run db:generate
```

Apply migrations explicitly through Aurora Data API:

```bash
export AWS_PROFILE=sandbox-admin
export AWS_REGION=us-east-1
export AWS_DEFAULT_REGION=us-east-1
export SIGNAL_TRACKER_DB_STAGE=prod
pnpm --filter signal-tracker-api run db:migrate:deployed
pnpm --filter signal-tracker-api run db:smoke:deployed
pnpm --filter signal-tracker-api run db:verify:deployed
```

The stage can be omitted while `prod` is the only configured database. The
legacy `SIGNAL_TRACKER_DB_NAME`, `SIGNAL_TRACKER_DB_RESOURCE_ARN`, and
`SIGNAL_TRACKER_DB_SECRET_ARN` variables are still supported as a one-off
override for debugging a specific Aurora target.

`db:migrate:deployed` uses the app-owned AWS Data API runner in `scripts/`
rather than the Drizzle Kit CLI. It performs a Data API preflight, retries known
Aurora resume errors such as `DatabaseResumingException`, applies migrations
through Drizzle ORM, and prints the phase, SQLState, and AWS request ID when a
deployed database operation fails.

`db:verify:deployed` reads `drizzle.__drizzle_migrations` and prints the
deployed migration ledger. Use it after deployed migrations to confirm the
database has the expected Drizzle migration history.

Deployed migrations are manual for now. They do not run automatically in the
deploy pipeline, and there is no migration Lambda.

### Endpoints

- `POST /get-health` -> `{ "ok": true }`
- `POST /create-topic` -> creates a durable topic row and returns `{ "topic": ... }`
- `POST /get-topic` -> reads a durable topic row by ID and returns `{ "topic": ... }`
- `POST /list-topics` -> lists active topic rows and returns `{ "topics": [...] }`
- `POST /update-topic` -> updates editable topic metadata and returns `{ "topic": ... }`
- `POST /archive-topic` -> archives a topic without hard deletion and returns `{ "topic": ... }`
- `POST /delete-topic` -> permanently deletes a topic row and returns `{ "topic": ... }`
- `POST /create-event-entry` -> creates a manual event entry row and returns `{ "entry": ... }`
- `POST /get-event-entry` -> reads an event entry row by ID and returns `{ "entry": ... }`
- `POST /update-event-entry` -> updates editable event entry fields and returns `{ "entry": ... }`

Archived topics are hidden from `POST /list-topics` by default but remain
directly readable by ID. Deleted topics are removed from persistence.

### Postman

The Signal Tracker Postman collection is generated from shared route contracts and colocated `*.postman-config.ts` files.

```bash
pnpm postman:generate --project signal-tracker
pnpm postman:validate --project signal-tracker
pnpm postman:run --project signal-tracker --env local
pnpm postman:sync --project signal-tracker
```

For `postman:sync`, set `POSTMAN_API_KEY` in your shell or in repo-root `.env.local`. Do not commit `.env.local`.

### CORS

CORS headers are enabled for local dev and deployed responses.
