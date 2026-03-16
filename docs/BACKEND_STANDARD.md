# BACKEND_STANDARD.md

## Framework stance
This repo standardizes on **Option A: minimal internal router** via `@repo/api-core`.

## Required API shape
`apps/<domain>/<project>/<project>-api/src`:
- `app/router.ts`
- `app/context.ts`
- `routes/<feature>/<verb>-<feature>.ts`
- `lambda.ts`
- `local-dev.ts`

## Routing and HTTP method standard
- API routes are **POST by default** for consistency.
- Route paths should follow the route filename (without extension), e.g.:
  - `routes/hello/get-hello.ts` -> `POST /get-hello`
  - `routes/health/get-health.ts` -> `POST /get-health`
- Shared route specs should live in `<project>-shared` and be imported by API/infra/web.
- Register routes through `createRoute(...)` or `createPostRoute(...)` and `createRouter(...)` from `@repo/api-core`.

## Rules
- One Lambda entrypoint per project API by default.
- All API responses use `responses` helpers from `@repo/api-core`.
- Validation at boundaries uses schemas from `<project>-shared` for project-local contracts and `@repo/api-contracts` for repo-wide contracts.
- Request logs and unhandled errors use structured JSON logging from `@repo/api-core`.
- Local development server bootstrapping should use `startLocalDevServer` from `@repo/api-core`.

## Error/response format
- Success: route-specific JSON payload.
- Error: `{ "error": { "code": string, "message": string } }`.
- Not found code: `NOT_FOUND`.
- Unhandled code: `INTERNAL_ERROR`.
