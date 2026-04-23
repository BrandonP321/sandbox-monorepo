# Signal Tracker API

Lambda-style TypeScript API with a local dev server that shares the same handler logic.

## Local development

```bash
pnpm --filter signal-tracker-api dev
```

The server listens on `http://localhost:3001` by default.

### Endpoints

- `POST /get-health` -> `{ "ok": true }`

### CORS

CORS headers are enabled for local dev and deployed responses.
