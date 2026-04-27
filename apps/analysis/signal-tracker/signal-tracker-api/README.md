# Signal Tracker API

Lambda-style TypeScript API with a local dev server that shares the same handler logic.

## Local development

```bash
pnpm --filter signal-tracker-api dev
```

The server listens on `http://localhost:3001` by default.

## Database workflow

Issue #13 establishes the database and migration foundation only. The API still
uses the in-memory topic repository until the topic persistence issue adds the
first product table and adapter.

`POST /get-health` intentionally remains DB-free so health checks still work
while Aurora is paused or resuming.

### Local PostgreSQL

Local development uses local PostgreSQL, not deployed Aurora:

```bash
docker compose -f apps/analysis/signal-tracker/docker-compose.yml up -d postgres
export DATABASE_URL=postgres://signal_tracker:signal_tracker@localhost:5432/signal_tracker
pnpm --filter signal-tracker-api run db:migrate:local
```

The compose file lives at `apps/analysis/signal-tracker/docker-compose.yml`.

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
```

Deployed migrations are manual for now. They do not run automatically in the
deploy pipeline, and there is no migration Lambda.

### Endpoints

- `POST /get-health` -> `{ "ok": true }`
- `POST /create-topic` -> creates an in-memory topic and returns `{ "topic": ... }`

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
