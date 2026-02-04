# Hello World Fullstack Scaffold Notes

## Overview

This scaffold creates three apps under `apps/` plus shared config packages under `packages/`:

- `apps/hello-world-web`: Vite + React + TypeScript frontend
- `apps/hello-world-api`: Lambda-style TypeScript API with local dev server
- `apps/hello-world-infra`: AWS CDK stack (HTTP API + Lambda + S3/CloudFront)
- `packages/config-ts`: shared TypeScript configs
- `packages/config-eslint`: shared ESLint flat config
- `packages/config-test`: shared Vitest config snippet

## Key decisions

- Use Vite for fast frontend dev and build output to `dist/`.
- Use a shared `handleRequest` function in the API so Lambda and local dev share logic.
- Use `NodejsFunction` (esbuild) to bundle the Lambda for deployment.
- Deploy static web assets to S3 + CloudFront with SPA-friendly error routing.
- Skip static site resources if `hello-world-web/dist` is missing; CDK emits a warning.

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

Frontend uses `VITE_API_URL` and defaults to `http://localhost:3001` for local dev.

## Deployment notes

- Run `pnpm --filter hello-world-web build` before `pnpm --filter hello-world-infra deploy` so the `dist/` folder exists.
- CDK outputs `ApiBaseUrl` and `WebUrl` after deployment.
