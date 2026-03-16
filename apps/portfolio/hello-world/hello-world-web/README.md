# Hello World Web

React + TypeScript frontend powered by Vite. It currently uses local layout styles plus the shared `Button` and shared `@repo/ui/styles` entrypoint.

## Local development

```bash
pnpm --filter hello-world-web dev
```

The web app loads `/config.json` at runtime when deployed. For local dev it
defaults to `http://localhost:3001` if the runtime config is missing.

## UI foundation

This app still owns its page layout styles in `src/index.css`.
It also imports `@repo/ui/styles` in `src/main.tsx` and uses the shared `Button` primitive from `@repo/ui`.

Treat this app as a smoke-test consumer for the shared UI package, not as the source of truth for new shared patterns.

## Runtime config (deployed)

The CDK stack writes `/config.json` into the site bucket with the deployed API
base URL, so the web app doesn't need rebuild-time env injection.

## Override the API locally (optional)

If you want to point at a non-local API during dev, set `VITE_API_URL`:

```bash
VITE_API_URL="https://your-api-id.execute-api.region.amazonaws.com" pnpm --filter hello-world-web dev
```
