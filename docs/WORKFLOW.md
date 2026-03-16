# WORKFLOW.md — Standard Development Loop

## Quality bar
- Every behavioral change gets at least one test.
- Prioritize tests in shared packages (`api-core`, `api-contracts`, `infra-patterns`) and one smoke test per API/web app package.

## Daily loop
1. Implement the smallest shippable change.
2. Consolidate reusable code into `packages/*` before copying. If reuse is limited to a single project, prefer `apps/<domain>/<project>/<project>-shared`.
3. Run standard commands from repo root:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm build`
4. For project-scoped workflows:
   - `pnpm dev:project <project>`
   - `pnpm build:project <project>`
   - `pnpm deploy:project <project>`

## Backend defaults
- One API Lambda per project by default.
- API folders live at `apps/<domain>/<project>/<project>-api`.
- Route handlers in separate modules.
- POST routes with filename-based path naming (for example, `get-hello.ts` => `/get-hello`).
- Route specs shared by API/infra/web should live in `<project>-shared`.
- Shared response/error/logging helpers from `@repo/api-core`.
- Project-specific contracts from `<project>-shared`; repo-wide shared contracts from `@repo/api-contracts`.
