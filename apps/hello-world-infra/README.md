# Hello World Infra

AWS CDK stack for the Hello World API and static web site.

## Prerequisites

- AWS CLI configured (`aws configure`)
- CDK bootstrap (one-time per account/region):

```bash
pnpm --filter hello-world-infra exec cdk bootstrap
```

## Deploy

Build the frontend first so the `dist` folder exists:

```bash
VITE_API_URL=\"https://your-api-id.execute-api.region.amazonaws.com\" pnpm --filter hello-world-web build
```

If you want to use the local default, omit `VITE_API_URL`.

If `dist/` is missing, the CDK stack will skip the static site and emit a warning.

Then deploy:

```bash
pnpm --filter hello-world-infra deploy
```

## Outputs

- `ApiBaseUrl`: HTTP API endpoint
- `WebUrl`: CloudFront distribution URL for the frontend
