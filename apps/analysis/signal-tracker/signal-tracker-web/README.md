# Signal Tracker Web

React + TypeScript frontend powered by Vite. This scaffold intentionally uses native HTML elements and local CSS only.

## Local development

```bash
pnpm --filter signal-tracker-web dev
```

The web app loads `/config.json` at runtime when deployed. For local dev it
defaults to `http://localhost:3001` if the runtime config is missing.

## Runtime config (deployed)

The CDK stack writes `/config.json` into the site bucket with the deployed API
base URL, so the web app does not need rebuild-time env injection.

## State management

Redux Toolkit is wired through `src/store.ts`, with React-Redux typed hooks in
`src/storeHooks.ts`. RTK Query services live under `src/services/`; start new
server-state work by extending `signalTrackerApi` with shared route contracts
from `@repo/signal-tracker-shared`.

## Override the API locally (optional)

If you want to point at a non-local API during dev, set `VITE_API_URL`:

```bash
VITE_API_URL="https://your-api-id.execute-api.region.amazonaws.com" pnpm --filter signal-tracker-web dev
```
