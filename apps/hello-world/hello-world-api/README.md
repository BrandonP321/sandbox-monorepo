# Hello World API

Lambda-style TypeScript API with a local dev server that shares the same handler logic.

## Local development

```bash
pnpm --filter hello-world-api dev
```

The server listens on `http://localhost:3001` by default.

### Endpoints

- `GET /hello` -> `{ "message": "Hello World (backend)" }`
- `GET /healthz` -> `{ "ok": true }`

### CORS

CORS headers are enabled for local dev and deployed responses.
