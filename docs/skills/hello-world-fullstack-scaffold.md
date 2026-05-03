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
- Deploy CDK first, then build the web bundle with `VITE_API_BASE_URL` and sync `dist/` to S3.
- Keep API target resolution in `@repo/frontend-config`, using `VITE_API_BASE_URL`, then `VITE_API_STAGE`, then the local default.
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

## Env vars

Frontend uses `VITE_API_BASE_URL` when present, can use `VITE_API_STAGE` for
local stage shortcuts, and defaults to `http://localhost:3001` when no API env
vars are set.

## Deployment notes

- `pnpm --filter hello-world-infra deploy` deploys CDK, reads `ApiBaseUrl`, builds the web app with `VITE_API_BASE_URL`, syncs assets, and invalidates CloudFront.
- CDK outputs `ApiBaseUrl`, `WebUrl`, `WebBucketName`, and `WebDistributionId` after deployment.
