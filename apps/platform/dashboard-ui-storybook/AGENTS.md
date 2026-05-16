# AGENTS.md - Dashboard UI Storybook

Also follow the repo root `AGENTS.md` and `packages/dashboard-ui/AGENTS.md`.

## Scope

- This project deploys the `@repo/dashboard-ui` Storybook as a static site.
- Keep component implementation, stories, and package docs in
  `packages/dashboard-ui`.
- Keep deployment-only CDK, buildspecs, and CI/CD docs in
  `dashboard-ui-storybook-infra`.
- Do not add app-specific UI code here; this project is only the deploy wrapper
  for the shared package Storybook.

## Infra

- `dashboard-ui-storybook-infra` deploys static S3 and CloudFront hosting only.
- The publish step builds `@repo/dashboard-ui` with `build-storybook` and
  uploads `packages/dashboard-ui/storybook-static`.
- Avoid API Gateway, Lambda, or runtime app config unless the Storybook project
  explicitly grows a backend requirement.
