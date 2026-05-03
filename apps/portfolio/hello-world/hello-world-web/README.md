# Hello World Web

React + TypeScript frontend powered by Vite. It currently uses local layout styles plus the shared `Button` and shared `@repo/ui/styles` entrypoint.

## Local development

```bash
pnpm --filter hello-world-web dev
```

The web app uses `VITE_API_BASE_URL` when present. For local dev it defaults to
`http://localhost:3001` when no API env vars are set.

## UI foundation

This app still owns its page layout styles in `src/index.css`.
It also imports `@repo/ui/styles` in `src/main.tsx` and uses the shared `Button` primitive from `@repo/ui`.

Treat this app as a smoke-test consumer for the shared UI package, not as the source of truth for new shared patterns.

## API target config

The deploy pipeline builds the web bundle with `VITE_API_BASE_URL` set to the
deployed API URL. Because Vite embeds env vars at build time, changing the
deployed API target requires rebuilding and republishing the web assets.

## Override the API locally (optional)

If you want to point at a non-local API during dev, set `VITE_API_BASE_URL`:

```bash
VITE_API_BASE_URL="https://your-api-id.execute-api.region.amazonaws.com" pnpm --filter hello-world-web dev
```

For the current deployed Prod API, you can use the stage shortcut:

```bash
VITE_API_STAGE=prod pnpm --filter hello-world-web dev
```
