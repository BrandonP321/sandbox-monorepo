# Hello World Fullstack Scaffold Notes

## Overview

This scaffold creates three apps under `apps/` plus shared config packages under `packages/`:

- `apps/<domain>/hello-world/hello-world-web`: Vite + React + TypeScript frontend
- `apps/<domain>/hello-world/hello-world-api`: Lambda-style TypeScript API with local dev server
- `apps/<domain>/hello-world/hello-world-infra`: AWS CDK stack (HTTP API + Lambda + S3/CloudFront)
- `packages/config-ts`: shared TypeScript configs
- `packages/config-eslint`: shared ESLint flat config
- `packages/config-test`: shared Vitest config snippet
- `packages/ui`: shared UI foundation package for SCSS tokens, shared styles, utilities, and primitives

## Key decisions

- Use Vite for fast frontend dev and build output to `dist/`.
- Use a shared `handleRequest` function in the API so Lambda and local dev share logic.
- Use `NodejsFunction` (esbuild) to bundle the Lambda for deployment.
- Deploy static web assets to S3 + CloudFront with SPA-friendly error routing.
- Deploy a runtime `config.json` with the API base URL so the web app doesn't need rebuild-time env injection.
- Skip static site assets if `apps/<domain>/hello-world/hello-world-web/dist` is missing; CDK emits a warning.
- Web apps can consume `@repo/ui` when shared styling primitives are actually needed.
- The current UI direction is incremental: start with SCSS tokens and small local primitives, then promote patterns only after real reuse shows up.

## Scripts

Each app defines `dev`, `build`, `lint`, `typecheck`, and `test` so `pnpm dev/build/lint/test/typecheck` works at repo root via Turbo.

## CDK constructs

- `aws-apigatewayv2.HttpApi`
- `aws-apigatewayv2-integrations.HttpLambdaIntegration`
- `aws-lambda-nodejs.NodejsFunction`
- `aws-s3.Bucket`
- `aws-cloudfront.Distribution`
- `aws-s3-deployment.BucketDeployment`

## Env vars

Frontend loads `/config.json` at runtime and defaults to `http://localhost:3001` for local dev.
`VITE_API_URL` can still override the API during local dev if needed.

## Deployment notes

- `pnpm --filter hello-world-infra deploy` builds the web app and deploys API + web in one step.
- CDK outputs `ApiBaseUrl` and `WebUrl` after deployment.
