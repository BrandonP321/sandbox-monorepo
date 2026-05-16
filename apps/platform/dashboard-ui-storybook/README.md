# Dashboard UI Storybook

This project deploys the `@repo/dashboard-ui` Storybook as a static CloudFront
site so shared dashboard component changes have a reviewable UI artifact.

## Packages

- `@repo/dashboard-ui`: source package for components and Storybook stories.
- `dashboard-ui-storybook-infra`: AWS CDK deployment package for static
  Storybook hosting and the deploy pipeline.

## Local Development

```bash
pnpm --filter @repo/dashboard-ui storybook
```

## Validation

```bash
pnpm --filter @repo/dashboard-ui lint
pnpm --filter @repo/dashboard-ui typecheck
pnpm --filter @repo/dashboard-ui test
pnpm --filter @repo/dashboard-ui build-storybook

pnpm --filter dashboard-ui-storybook-infra lint
pnpm --filter dashboard-ui-storybook-infra typecheck
pnpm --filter dashboard-ui-storybook-infra test
pnpm --filter dashboard-ui-storybook-infra build
```

## Deployment

```bash
AWS_PROFILE=sandbox-admin pnpm --filter dashboard-ui-storybook-infra run deploy
```

The infra stack deploys S3 and CloudFront hosting, then publishes the built
Storybook assets from `packages/dashboard-ui/storybook-static`.

## CI/CD

Dashboard UI Storybook uses the repo's hybrid project pipeline:

- `.github/workflows/dashboard-ui-storybook.yml` detects shared repo changes
  and deploy wrapper changes.
- The GitHub workflow starts the AWS CodePipeline named
  `dashboard-ui-storybook-prod` on pushes to `main`.
- `dashboard-ui-storybook-infra/buildspec.validate.yml` runs lint, typecheck,
  tests, package builds, and `@repo/dashboard-ui` Storybook build.
- `dashboard-ui-storybook-infra/buildspec.prod.yml` deploys the stack, publishes
  the static Storybook assets, and exports the `WEB_URL` pipeline variable.

One-time setup requires deploying `dashboard-ui-storybook-infra`, completing the
`dash-ui-storybook-prod-source` CodeConnections GitHub handshake in AWS if it
is still pending, and ensuring the GitHub repo variable `AWS_ACCOUNT_ID` is set
to the sandbox account ID.
