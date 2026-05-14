# Portfolio

Portfolio is the personal website app family for showcasing experience,
projects, and writing.

## Packages

- `portfolio-web`: React/Vite frontend for the portfolio site.
- `portfolio-infra`: AWS CDK deployment package for static SPA hosting and the
  deploy pipeline.

This app does not have an API package.

## Local Development

```bash
pnpm --filter portfolio-web dev
```

For phone testing on the same network, run the LAN helper and scan the printed
QR code:

```bash
pnpm --filter portfolio-web lan
```

## Validation

```bash
pnpm --filter portfolio-web lint
pnpm --filter portfolio-web typecheck
pnpm --filter portfolio-web test
pnpm --filter portfolio-web build

pnpm --filter portfolio-infra lint
pnpm --filter portfolio-infra typecheck
pnpm --filter portfolio-infra test
pnpm --filter portfolio-infra build
```

## Deployment

```bash
AWS_PROFILE=sandbox-admin pnpm --filter portfolio-infra run deploy
```

The infra stack deploys S3 and CloudFront hosting, then publishes the built web
assets from `portfolio-web/dist`.

## CI/CD

Portfolio uses the repo's hybrid project pipeline:

- `.github/workflows/portfolio.yml` detects portfolio or shared repo changes.
- The GitHub workflow starts the AWS CodePipeline named `portfolio-prod` on
  pushes to `main`.
- `portfolio-infra/buildspec.validate.yml` runs lint, typecheck, tests, and
  builds for `portfolio-web` and `portfolio-infra`.
- `portfolio-infra/buildspec.prod.yml` deploys the stack, publishes the static
  web assets, and exports the `WEB_URL` pipeline variable.

One-time setup requires deploying `portfolio-infra`, completing the
`portfolio-prod-source` CodeConnections GitHub handshake in AWS if it is still
pending, and ensuring the GitHub repo variable `AWS_ACCOUNT_ID` is set to the
sandbox account ID.
