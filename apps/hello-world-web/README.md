# Hello World Web

React + TypeScript frontend powered by Vite.

## Local development

```bash
pnpm --filter hello-world-web dev
```

The web app expects the API at `http://localhost:3001` by default.

## Point to a deployed API

Set `VITE_API_URL` to your deployed API base URL before building or starting:

```bash
VITE_API_URL="https://your-api-id.execute-api.region.amazonaws.com" pnpm --filter hello-world-web dev
```
