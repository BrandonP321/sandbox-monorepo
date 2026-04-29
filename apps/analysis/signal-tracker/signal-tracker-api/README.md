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

## Database workflow

`POST /create-topic` uses PostgreSQL-backed durable persistence after the
database migrations have been applied.

`POST /get-health` intentionally remains DB-free so health checks still work
while Aurora is paused or resuming.

### Local database target

The baseline local database target is local PostgreSQL:

```bash
docker compose -f apps/analysis/signal-tracker/docker-compose.yml up -d postgres
cp apps/analysis/signal-tracker/.env.example apps/analysis/signal-tracker/.env.local
# Set DATABASE_URL=postgres://signal_tracker:signal_tracker@localhost:5432/signal_tracker
pnpm --filter signal-tracker-api run db:migrate:local
```

The compose file lives at `apps/analysis/signal-tracker/docker-compose.yml`.
Run the local migration before using `POST /create-topic`; otherwise topic
creation will return `PERSISTENCE_UNAVAILABLE`.

Temporary early-development exception: local API development may point at the
Prod Aurora PostgreSQL database through `apps/analysis/signal-tracker/.env.local`
while the app is pre-release and low-traffic. Treat this as Prod data: avoid
destructive/manual data changes and do not add seed/reset scripts against Prod.

### Drizzle migrations

Migrations are generated from `src/db/schema.ts` into `drizzle/`:

```bash
pnpm --filter signal-tracker-api run db:generate
```

Apply local migrations with:

```bash
pnpm --filter signal-tracker-api run db:migrate:local
```

Apply deployed migrations explicitly through Aurora Data API after exporting the
stack output values:

```bash
export AWS_PROFILE=sandbox-admin
export AWS_REGION=us-east-1
export AWS_DEFAULT_REGION=us-east-1
export SIGNAL_TRACKER_DB_NAME=signal_tracker
export SIGNAL_TRACKER_DB_RESOURCE_ARN=<SignalTrackerDatabaseResourceArn>
export SIGNAL_TRACKER_DB_SECRET_ARN=<SignalTrackerDatabaseSecretArn>
pnpm --filter signal-tracker-api run db:migrate:deployed
pnpm --filter signal-tracker-api run db:smoke:deployed
pnpm --filter signal-tracker-api run db:verify:deployed
```

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
