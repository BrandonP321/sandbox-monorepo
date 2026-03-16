# Hello World Web

React + TypeScript frontend powered by Vite, using the shared `@repo/ui` package (Mantine-based).

## Local development

```bash
pnpm --filter hello-world-web dev
```

The web app loads `/config.json` at runtime when deployed. For local dev it
defaults to `http://localhost:3001` if the runtime config is missing.

## UI design system

`@repo/ui` is the standard UI layer for this app. Base styles are imported from
`@repo/ui/styles` in `src/main.tsx`, and theming is handled by `UiProvider`.

## Runtime config (deployed)

The CDK stack writes `/config.json` into the site bucket with the deployed API
base URL, so the web app doesn't need rebuild-time env injection.

## Override the API locally (optional)

If you want to point at a non-local API during dev, set `VITE_API_URL`:

```bash
VITE_API_URL="https://your-api-id.execute-api.region.amazonaws.com" pnpm --filter hello-world-web dev
```
