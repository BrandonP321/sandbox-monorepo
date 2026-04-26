# Signal Tracker API

Lambda-style TypeScript API with a local dev server that shares the same handler logic.

## Local development

```bash
pnpm --filter signal-tracker-api dev
```

The server listens on `http://localhost:3001` by default.

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
