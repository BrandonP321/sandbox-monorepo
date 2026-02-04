# Hello World Infra

AWS CDK stack for the Hello World API and static web site.

## Prerequisites

- AWS CLI configured (`aws configure`)
- CDK bootstrap (one-time per account/region):

```bash
pnpm --filter hello-world-infra exec cdk bootstrap
```

## Deploy

Deploy builds the frontend and deploys API + web in one command:

```bash
pnpm --filter hello-world-infra deploy
```

The stack also writes `/config.json` into the site bucket so the frontend picks
up the deployed API URL at runtime.

If `dist/` is missing, the CDK stack will skip static assets and emit a warning.

## Outputs

- `ApiBaseUrl`: HTTP API endpoint
- `WebUrl`: CloudFront distribution URL for the frontend
